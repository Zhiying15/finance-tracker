package com.finance.service.impl

import com.fasterxml.jackson.databind.ObjectMapper
import com.finance.constants.ReviewStatus
import com.finance.constants.TransactionStatus
import com.finance.dto.ParsedTransaction
import com.finance.dto.request.ImportTransactionReviewItem
import com.finance.dto.request.ImportTransactionUpdateRequest
import com.finance.entity.Account
import com.finance.entity.ImportedFile
import com.finance.entity.ImportedTransaction
import com.finance.entity.Transaction
import com.finance.entity.User
import java.nio.charset.StandardCharsets
import com.finance.exception.AppException
import com.finance.repository.AccountRepository
import com.finance.repository.ImportedFileRepository
import com.finance.repository.ImportedTransactionRepository
import com.finance.repository.TransactionRepository
import com.finance.repository.UserRepository
import com.finance.service.ImportService
import org.springframework.transaction.annotation.Transactional
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.math.BigDecimal

@Service
class ImportServiceImpl(
    private val importBatchRepository: ImportedFileRepository,
    private val importedTransactionRepository: ImportedTransactionRepository,
    private val transactionRepository: TransactionRepository,
    private val accountRepository: AccountRepository,
    private val userRepository: UserRepository,
    private val ollamaParserService: OllamaParserService,
    private val objectMapper: ObjectMapper,
) : ImportService {

    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional
    override fun uploadFile(userId: String, file: MultipartFile, accountId: String): String {
        val user: User = userRepository.findById(userId)
            .orElseThrow { AppException.NotFound("User not found") }

        accountRepository.findByIdAndUserId(accountId, userId)
            ?: throw AppException.Forbidden("Account not found or access denied")

        val newBatch: ImportedFile = ImportedFile(
            user = user,
            filename = file.originalFilename,
            status = "PROCESSING",
        )
        val batch: ImportedFile = importBatchRepository.save(newBatch)

        val content = file.inputStream.readBytes().toString(StandardCharsets.UTF_8)
        val rows = content.lines().filter { it.isNotBlank() }

        rows.forEachIndexed { index, row ->
            val result = ollamaParserService.parseRow(row)

            val duplicateStatus: ReviewStatus = when {
                result.parseError != null -> ReviewStatus.NEW
                isDuplicate(userId, result.parsed) -> ReviewStatus.POSSIBLE_DUPLICATE
                else -> ReviewStatus.NEW
            }

            val newImportTx: ImportedTransaction = ImportedTransaction(
                file = batch,
                jsonData = result.parsed?.let { objectMapper.writeValueAsString(it) },
                parseError = result.parseError,
                reviewStatus = duplicateStatus,
            )
            importedTransactionRepository.save(newImportTx)
        }

        batch.status = "PENDING_REVIEW"
        importBatchRepository.save(batch)

        return batch.id
    }

    @Transactional(readOnly = true)
    override fun getBatchReviewItems(userId: String, batchId: String): List<ImportTransactionReviewItem> {
        val batch = importBatchRepository.findById(batchId)
            .orElseThrow { AppException.NotFound("Import batch not found") }

        if (batch.user.id != userId) throw AppException.Forbidden("Access denied")

        return importedTransactionRepository.findAllByBatchId(batchId)
            .map { it.toReviewItem() }
    }

    @Transactional
    override fun updateImportTransaction(
        userId: String,
        batchId: String,
        importTxId: String,
        request: ImportTransactionUpdateRequest,
    ): ImportTransactionReviewItem {
        val batch = importBatchRepository.findById(batchId)
            .orElseThrow { AppException.NotFound("Batch not found") }

        if (batch.user.id != userId) throw AppException.Forbidden("Access denied")

        val importTx = importedTransactionRepository.findByIdAndBatchId(importTxId, batchId)
            ?: throw AppException.NotFound("Import transaction not found")

        importTx.jsonData = objectMapper.writeValueAsString(importTx)
        importTx.reviewStatus = ReviewStatus.NEW
        importTx.parseError = null

        return importedTransactionRepository.save(importTx).toReviewItem()
    }

    @Transactional
    override fun approveImportTransaction(
        userId: String,
        batchId: String,
        importTxId: String,
        accountId: String,
    ): String {
        val batch = importBatchRepository.findById(batchId)
            .orElseThrow { AppException.NotFound("Batch not found") }

        if (batch.user.id != userId) throw AppException.Forbidden("Access denied")

        val importTx = importedTransactionRepository.findByIdAndBatchId(importTxId, batchId)
            ?: throw AppException.NotFound("Import transaction not found")

        if (importTx.jsonData == null) {
            throw AppException.BadRequest("Cannot approve a transaction with a parse error — please edit it first")
        }

        val parsed = objectMapper.readValue(importTx.jsonData, ParsedTransaction::class.java)
        val account = accountRepository.findByIdAndUserId(accountId, userId)
            ?: throw AppException.Forbidden("Account not found or access denied")

        val user = userRepository.findById(userId)
            .orElseThrow { AppException.NotFound("User not found") }

        val currency = account.currency

        val transaction = Transaction(
            user = user,
            fromAccount = if (parsed.isInflow == false) account else null,
            toAccount = if (parsed.isInflow == true) account else null,
            transactionDate = parsed.transactionDate ?: throw AppException.BadRequest("Transaction date is required"),
            description = parsed.description,
            amount = parsed.amount ?: throw AppException.BadRequest("Amount is required"),
            currency = currency,
            isManual = false,
            importedTransaction = importTx,
        )

        val saved = transactionRepository.save(transaction)

        // Update account balance atomically
        updateAccountBalance(account, parsed.amount, parsed.isInflow ?: true)

        importTx.approved = true
        importTx.reviewStatus = ReviewStatus.APPROVED
        importedTransactionRepository.save(importTx)

        return saved.id
    }

    @Transactional
    override fun rejectImportTransaction(userId: String, batchId: String, importTxId: String) {
        val batch = importBatchRepository.findById(batchId)
            .orElseThrow { AppException.NotFound("Batch not found") }

        if (batch.user.id != userId) throw AppException.Forbidden("Access denied")

        val importTx = importedTransactionRepository.findByIdAndBatchId(importTxId, batchId)
            ?: throw AppException.NotFound("Import transaction not found")

        importTx.reviewStatus = ReviewStatus.REJECTED
        importedTransactionRepository.save(importTx)
    }

    private fun updateAccountBalance(account: Account, amount: BigDecimal, isInflow: Boolean) {
        account.currentBalance = if (isInflow) {
            account.currentBalance + amount
        } else {
            account.currentBalance - amount
        }
        accountRepository.save(account)
    }

    private fun isDuplicate(userId: String, parsed: ParsedTransaction?): Boolean {
        if (parsed == null) return false
        if (parsed.referenceNumber != null) {
            return transactionRepository.existsByUserIdAndReferenceNumberAndReferenceNumberIsNotNull(
                userId, parsed.referenceNumber
            )
        }
        if (parsed.amount != null && parsed.transactionDate != null) {
            return transactionRepository.existsByUserIdAndAmountAndTransactionDateAndReferenceNumberIsNull(
                userId, parsed.amount, parsed.transactionDate
            )
        }
        return false
    }

    private fun ImportedTransaction.toReviewItem() = ImportTransactionReviewItem(
        id = id,
        reviewStatus = reviewStatus,
        approved = approved,
        parseError = parseError,
        parsedData = jsonData?.let {
            runCatching { objectMapper.readValue(it, ImportTransactionReviewItem.ParsedData::class.java) }.getOrNull()
        },
    )
}