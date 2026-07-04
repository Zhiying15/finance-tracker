package com.financeimporting.service.impl

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import common.constants.ReviewStatus
import common.constants.TransactionFlow
import importing.dto.OllamaParseResult
import importing.dto.ParsedTransactionFields
import importing.dto.response.ImportFileResponse
import importing.dto.response.ImportTransactionReviewResponse
import entity.Account
import entity.ImportedFile
import entity.ImportedTransaction
import entity.Transaction
import common.exception.AppException
import account.repository.AccountRepository
import com.finance.account.service.AccountService
import importing.repository.ImportedFileRepository
import importing.repository.ImportedTransactionRepository
import importing.service.ImportService
import importing.service.OllamaParserService
import importing.dto.BulkActionResult
import importing.dto.request.ImportTransactionUpdateRequest
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import transaction.repository.TransactionRepository
import com.finance.user.repository.UserRepository
import java.math.BigDecimal
import java.nio.charset.StandardCharsets

@Async("ollamaTaskExecutor")
@Service
class ImportServiceImpl(
    private val importedFileRepository: ImportedFileRepository,
    private val importedTransactionRepository: ImportedTransactionRepository,
    private val transactionRepository: TransactionRepository,
    private val accountRepository: AccountRepository,
    private val accountService: AccountService,
    private val userRepository: UserRepository,
    private val ollamaParserService: OllamaParserService,
    private val objectMapper: ObjectMapper,
) : ImportService {
    private val log = LoggerFactory.getLogger(javaClass)

    // -----------------------------------------------
    // Upload — create batch record, kick off async parse
    // -----------------------------------------------

    @Transactional
    override fun uploadFile(
        userId: String,
        file: MultipartFile,
        accountId: String,
    ): ImportFileResponse {
        // BOLA — confirm account belongs to user
        val account = accountService.findOwnedAccount(userId, accountId)

        val user = userRepository.findById(userId)
            .orElseThrow { AppException.NotFound("User not found") }

        val importedFile = ImportedFile(
            user     = user,
            account  = account,    // ← add this
            filename = file.originalFilename,
            status   = "PROCESSING",
        )
        val savedFile = importedFileRepository.save(importedFile)

        // Read content eagerly before passing to async method
        // MultipartFile input stream closes after the request thread ends
        val content = file.inputStream
            .readBytes()
            .toString(StandardCharsets.UTF_8)

        // Kick off async Ollama parsing — returns immediately
        parseFileAsync(savedFile.id, content, userId, account)

        return buildFileResponse(savedFile, userId)
    }

    // -----------------------------------------------
    // Async parsing pipeline
    // -----------------------------------------------

    @Async
    @Transactional
    override fun parseFileAsync(
        fileId: String,
        content: String,
        userId: String,
        account: Account,
    ) {
        log.info("Starting async parse for fileId=$fileId")

        val importedFile = importedFileRepository.findById(fileId).orElse(null) ?: run {
            log.error("ImportedFile $fileId not found during async parse")
            return
        }

        try {
            val rows = content
                .lines()
                .filter { it.isNotBlank() }
                .let { lines ->
                    // Auto-detect and skip header row
                    if (lines.isNotEmpty() && looksLikeHeader(lines.first())) {
                        lines.drop(1)
                    } else {
                        lines
                    }
                }

            rows.forEachIndexed { index, row ->
                try {
                    val result         = ollamaParserService.parseRow(row)
                    val reviewStatus   = determineReviewStatus(userId, result)
                    val jsonData       = result.parsed
                        ?.let { objectMapper.writeValueAsString(it) }

                    val importedTx = ImportedTransaction(
                        file         = importedFile,
                        jsonData     = jsonData,
                        parseError   = result.parseError,
                        reviewStatus = reviewStatus,
                    )
                    importedTransactionRepository.save(importedTx)

                } catch (ex: Exception) {
                    log.error("Row $index parse error in file $fileId: ${ex.message}")
                    importedTransactionRepository.save(
                        ImportedTransaction(
                            file       = importedFile,
                            jsonData   = null,
                            parseError = "System error: ${ex.message?.take(400)}",
                        )
                    )
                }
            }

            importedFile.status = "PENDING_REVIEW"
            importedFileRepository.save(importedFile)
            log.info("Async parse complete for fileId=$fileId — ${rows.size} rows processed")

        } catch (ex: Exception) {
            log.error("Fatal parse failure for fileId=$fileId: ${ex.message}", ex)
            importedFile.status = "FAILED"
            importedFileRepository.save(importedFile)
        }
    }

    // -----------------------------------------------
    // Queries
    // -----------------------------------------------

    @Transactional(readOnly = true)
    override fun listFiles(userId: String): List<ImportFileResponse> =
        importedFileRepository
            .findAllByUserIdOrderByCreatedAtDesc(userId)
            .map { buildFileResponse(it, userId) }

    @Transactional(readOnly = true)
    override fun getFile(userId: String, fileId: String): ImportFileResponse {
        val file = findOwnedFile(userId, fileId)
        return buildFileResponse(file, userId)
    }

    @Transactional(readOnly = true)
    override fun getReviewItems(
        userId: String,
        fileId: String,
    ): List<ImportTransactionReviewResponse> {
        findOwnedFile(userId, fileId)

        return importedTransactionRepository
            .findAllByFileIdOrderByCreatedAtAsc(fileId)
            .map { entity ->
                val parsed = deserializeParsed(entity.jsonData)
                ImportTransactionReviewResponse.from(entity, parsed)
            }
    }

    // -----------------------------------------------
    // Row-level actions
    // -----------------------------------------------

    @Transactional
    override fun updateReviewRow(
        userId: String,
        fileId: String,
        importTxId: String,
        request: ImportTransactionUpdateRequest,
    ): ImportTransactionReviewResponse {
        findOwnedFile(userId, fileId)

        val importTx = findOwnedImportTx(fileId, importTxId)

        if (importTx.approved) {
            throw AppException.BadRequest("Cannot edit an already approved transaction")
        }

        // Merge user edits back into json_data
        val updated = ParsedTransactionFields(
            transactionDate = request.transactionDate,
            description = request.description,
            amount = request.amount,
            isInflow = request.isInflow,
            currency = request.currency,
        )

        importTx.jsonData     = objectMapper.writeValueAsString(updated)
        importTx.parseError   = null
        importTx.reviewStatus = ReviewStatus.NEW

        val saved = importedTransactionRepository.save(importTx)
        return ImportTransactionReviewResponse.from(saved, updated)
    }

    @Transactional
    override fun approveRow(
        userId: String,
        fileId: String,
        importTxId: String,
        accountId: String,
    ): ImportTransactionReviewResponse {
        val account  = accountService.findOwnedAccount(userId, accountId)
        findOwnedFile(userId, fileId)

        val importTx = findOwnedImportTx(fileId, importTxId)

        if (importTx.approved) {
            throw AppException.BadRequest("Transaction already approved")
        }
        if (importTx.jsonData == null) {
            throw AppException.BadRequest(
                "Cannot approve a row with a parse error — edit it first"
            )
        }

        val parsed = deserializeParsed(importTx.jsonData)
            ?: throw AppException.BadRequest("Row data is missing — edit the row before approving")

        val transaction = buildTransaction(userId, parsed, importTx, account)
        transactionRepository.save(transaction)

        // Update account balance immediately
        applyBalanceChange(account, parsed.amount!!, parsed.isInflow!!)

        importTx.approved     = true
        importTx.reviewStatus = ReviewStatus.APPROVED
        importedTransactionRepository.save(importTx)

        updateFileStatusIfComplete(fileId)

        return ImportTransactionReviewResponse.from(importTx, parsed)
    }

    @Transactional
    override fun rejectRow(
        userId: String,
        fileId: String,
        importTxId: String,
    ): ImportTransactionReviewResponse {
        findOwnedFile(userId, fileId)
        val importTx = findOwnedImportTx(fileId, importTxId)

        if (importTx.approved) {
            throw AppException.BadRequest("Cannot reject an already approved transaction")
        }

        importTx.reviewStatus = ReviewStatus.REJECTED
        val saved = importedTransactionRepository.save(importTx)

        updateFileStatusIfComplete(fileId)

        return ImportTransactionReviewResponse.from(saved, deserializeParsed(saved.jsonData))
    }

    // -----------------------------------------------
    // Bulk actions — Option C from requirements
    // -----------------------------------------------

    @Transactional
    override fun bulkApproveNew(
        userId: String,
        fileId: String,
        accountId: String,
    ): BulkActionResult {
        val account = accountService.findOwnedAccount(userId, accountId)
        findOwnedFile(userId, fileId)

        // Only approve NEW rows — POSSIBLE_DUPLICATE requires individual review
        val newRows = importedTransactionRepository
            .findAllByFileIdAndReviewStatus(fileId, ReviewStatus.NEW)
            .filter { !it.approved && it.jsonData != null && it.parseError == null }

        var successCount = 0
        var skippedCount = 0

        newRows.forEach { importTx ->
            val parsed = deserializeParsed(importTx.jsonData)

            // Skip rows with incomplete data — user must edit manually
            if (parsed?.transactionDate == null ||
                parsed.amount == null ||
                parsed.isInflow == null
            ) {
                skippedCount++
                return@forEach
            }

            val transaction = buildTransaction(userId, parsed, importTx, account)
            transactionRepository.save(transaction)
            applyBalanceChange(account, parsed.amount, parsed.isInflow)

            importTx.approved     = true
            importTx.reviewStatus = ReviewStatus.APPROVED
            importedTransactionRepository.save(importTx)
            successCount++
        }

        updateFileStatusIfComplete(fileId)

        return BulkActionResult(
            approved = successCount,
            skipped = skippedCount,
            message = "$successCount rows approved. $skippedCount skipped (incomplete data — edit required).",
        )
    }

    @Transactional
    override fun bulkRejectNew(
        userId: String,
        fileId: String,
    ): BulkActionResult {
        findOwnedFile(userId, fileId)

        val newRows = importedTransactionRepository
            .findAllByFileIdAndReviewStatus(fileId, ReviewStatus.NEW)
            .filter { !it.approved }

        newRows.forEach { importTx ->
            importTx.reviewStatus = ReviewStatus.REJECTED
            importedTransactionRepository.save(importTx)
        }

        updateFileStatusIfComplete(fileId)

        return BulkActionResult(
            approved = 0,
            skipped  = 0,
            message  = "${newRows.size} rows rejected.",
        )
    }

    // -----------------------------------------------
    // Internal — helpers
    // -----------------------------------------------

    private fun buildTransaction(
        userId: String,
        parsed: ParsedTransactionFields,
        importTx: ImportedTransaction,
        account: Account,
    ): Transaction {
        val user = userRepository.findById(userId)
            .orElseThrow { AppException.NotFound("User not found") }

        val currencyCode = parsed.currency ?: account.currency.code
        val currency     = transactionRepository.findCurrencyByCode(currencyCode)
            ?: account.currency // fallback to account currency if unknown

        // Account is always the from_account for this file (user's DBS account)
        // to_account is null for outflows — null means external party
        val fromAccount = if (parsed.isInflow == false) account else null
        val toAccount   = if (parsed.isInflow == true)  account else null

        return Transaction(
            user                = user,
            fromAccount         = fromAccount,
            toAccount           = toAccount,
            transactionFlow     = if (parsed.isInflow == true) TransactionFlow.INFLOW
            else TransactionFlow.OUTFLOW,
            importedTransaction = importTx,
            transactionDate     = parsed.transactionDate!!,
            description         = parsed.description?.trim(),
            amount              = parsed.amount!!,
            currency            = currency,
            isManual            = false,
            budgetType          = null, // User tags budget type post-import via PATCH /transactions
        )
    }

    private fun applyBalanceChange(
        account: Account,
        amount: BigDecimal,
        isInflow: Boolean,
    ) {
        account.currentBalance = if (isInflow) {
            account.currentBalance + amount
        } else {
            account.currentBalance - amount
        }
        accountRepository.save(account)
    }

    private fun determineReviewStatus(
        userId: String,
        result: OllamaParseResult,
    ): ReviewStatus {
        val parsed = result.parsed ?: return ReviewStatus.NEW

        // Can only check duplicate if we have the minimum fields
        if (parsed.amount == null ||
            parsed.transactionDate == null ||
            parsed.description == null
        ) return ReviewStatus.NEW

        val isDuplicate = importedTransactionRepository.existsDuplicate(
            userId          = userId,
            amount          = parsed.amount,
            transactionDate = parsed.transactionDate,
            description     = parsed.description,
        )

        return if (isDuplicate) ReviewStatus.POSSIBLE_DUPLICATE else ReviewStatus.NEW
    }

    private fun updateFileStatusIfComplete(fileId: String) {
        val total    = importedTransactionRepository.countByFileId(fileId)
        val approved = importedTransactionRepository.countByFileIdAndApprovedTrue(fileId)
        val rejected = importedTransactionRepository.countByFileIdAndReviewStatus(
            fileId, ReviewStatus.REJECTED
        )

        // File is COMPLETED when every row has been actioned
        if (approved + rejected >= total) {
            val file = importedFileRepository.findById(fileId).orElse(null) ?: return
            file.status = "COMPLETED"
            importedFileRepository.save(file)
        }
    }

    private fun buildFileResponse(
        file: ImportedFile,
        userId: String,
    ): ImportFileResponse {
        val total     = importedTransactionRepository.countByFileId(file.id)
        val approved  = importedTransactionRepository.countByFileIdAndApprovedTrue(file.id)
        val rejected  = importedTransactionRepository.countByFileIdAndReviewStatus(
            file.id, ReviewStatus.REJECTED
        )
        val duplicate = importedTransactionRepository.countByFileIdAndReviewStatus(
            file.id, ReviewStatus.POSSIBLE_DUPLICATE
        )
        val errors    = importedTransactionRepository.countByFileIdAndParseErrorIsNotNull(file.id)
        val pending   = total - approved - rejected

        return ImportFileResponse(
            id            = file.id,
            filename      = file.filename,
            status        = file.status,
            accountId   = file.account.id,      // ← from entity
            accountName = file.account.name,    // ← from entity
            totalRows     = total,
            pendingRows   = pending,
            approvedRows  = approved,
            rejectedRows  = rejected,
            duplicateRows = duplicate,
            parseErrorRows = errors,
            createdAt     = file.createdAt,
            updatedAt     = file.updatedAt,
        )
    }

    private fun looksLikeHeader(line: String): Boolean {
        val lower = line.lowercase()
        val headerKeywords = listOf(
            "date", "description", "amount",
            "debit", "credit", "reference",
            "transaction", "balance",
        )
        return headerKeywords.count { lower.contains(it) } >= 2
    }

    private fun deserializeParsed(jsonData: String?): ParsedTransactionFields? =
        jsonData?.let {
            runCatching { objectMapper.readValue<ParsedTransactionFields>(it) }.getOrNull()
        }

    private fun findOwnedFile(userId: String, fileId: String): ImportedFile =
        importedFileRepository.findByIdAndUserId(fileId, userId)
            ?: throw AppException.Forbidden("Import file not found or access denied")

    private fun findOwnedImportTx(
        fileId: String,
        importTxId: String,
    ): ImportedTransaction =
        importedTransactionRepository.findByIdAndFileId(importTxId, fileId)
            ?: throw AppException.NotFound("Import transaction not found")
}
