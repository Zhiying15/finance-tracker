package com.finance.service.impl

import com.finance.constants.AccountCategory
import com.finance.constants.AssetClass
import com.finance.constants.BudgetType
import com.finance.constants.TransactionFlow
import com.finance.constants.TransactionStatus
import com.finance.dto.request.TransactionRequest
import com.finance.dto.request.TransactionUpdateRequest
import com.finance.dto.response.TransactionResponse
import com.finance.entity.Account
import com.finance.entity.Transaction
import com.finance.exception.AppException
import com.finance.repository.AccountRepository
import com.finance.repository.CategoryRepository
import com.finance.repository.MerchantRepository
import com.finance.repository.TransactionRepository
import com.finance.repository.TransactionTypeRepository
import com.finance.repository.UserRepository
import com.finance.service.TransactionsService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
class TransactionsServiceImpl(
    private val transactionRepository: TransactionRepository,
    private val accountRepository: AccountRepository,
    private val transactionTypeRepository: TransactionTypeRepository,
    private val categoryRepository: CategoryRepository,
    private val merchantRepository: MerchantRepository,
    private val userRepository: UserRepository,
) : TransactionsService {

    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional(readOnly = true)
    override fun listTransactions(userId: String): List<TransactionResponse> =
        transactionRepository.findAllByUserIdOrderByTransactionDateDesc(userId)
            .map { TransactionResponse.from(it) }

    @Transactional
    override fun createManualTransaction(userId: String, request: TransactionRequest): TransactionResponse {
        val user = userRepository.findById(userId).orElseThrow { AppException.NotFound("User not found") }

        val txType = transactionTypeRepository.findById(request.transactionTypeId)
            .orElseThrow { AppException.NotFound("Transaction type not found") }

        val fromAccount = request.fromAccountId?.let {
            accountRepository.findByIdAndUserId(it, userId)
                ?: throw AppException.Forbidden("From-account not found or access denied")
        }

        val toAccount = request.toAccountId?.let {
            accountRepository.findByIdAndUserId(it, userId)
                ?: throw AppException.Forbidden("To-account not found or access denied")
        }

        val category = request.categoryId?.let {
            categoryRepository.findById(it).orElseThrow { AppException.NotFound("Category not found") }
        }

        val currency = accountRepository.findCurrencyByCode(request.currencyCode)
            ?: throw AppException.NotFound("Currency not found")

        // Resolve budget type: use provided, or fall back to category default
        val resolvedBudgetType = request.budgetType
            ?: category?.budgetType
            ?: resolveBudgetTypeFromTransfer(txType.flow, fromAccount, toAccount, userId)

        val transaction = Transaction(
            user = user,
            fromAccount = fromAccount,
            toAccount = toAccount,
            transactionType = txType,
            category = category,
            merchant = request.merchantId?.let { merchantRepository.findById(it).orElse(null) },
            transactionDate = request.transactionDate,
            description = request.description,
            referenceNumber = request.referenceNumber,
            amount = request.amount,
            currency = currency,
            exchangeRate = request.exchangeRate,
            remarks = request.remarks,
            isManual = true,
            isRecurring = request.isRecurring,
            status = TransactionStatus.APPROVED,
            budgetType = resolvedBudgetType,
        )

        val saved = transactionRepository.save(transaction)

        // Atomic balance updates
        applyBalanceChanges(txType.flow, fromAccount, toAccount, request.amount)

        return TransactionResponse.from(saved)
    }

    @Transactional
    override fun voidTransaction(userId: String, transactionId: String) {
        val tx = transactionRepository.findByIdAndUserId(transactionId, userId)
            ?: throw AppException.Forbidden("Transaction not found or access denied")

        if (tx.status == TransactionStatus.VOID) throw AppException.BadRequest("Transaction is already void")

        // Reverse the balance changes
        val flow = tx.transactionType?.flow ?: TransactionFlow.OUTFLOW
        reverseBalanceChanges(flow, tx.fromAccount, tx.toAccount, tx.amount)

        tx.status = TransactionStatus.VOID
        tx.updatedAt = java.time.LocalDateTime.now()
        transactionRepository.save(tx)
    }

    private fun resolveBudgetTypeFromTransfer(
        flow: TransactionFlow,
        fromAccount: Account?,
        toAccount: Account?,
        userId: String,
    ): BudgetType? {
        if (flow != TransactionFlow.TRANSFER) return null

        // Both accounts belong to same user → EXCLUDED
        if (fromAccount != null && toAccount != null) {
            val toAssetClass = toAccount.accountType.assetClass
            val toCategory = toAccount.accountType.category

            // Credit card payment: from bank → to credit card = EXCLUDED (offset by expense txns)
            if (toAssetClass == AssetClass.CREDIT_CARD) return BudgetType.EXCLUDED

            // Investment top-up = prefill SAVINGS, user can override
            if (toAssetClass in listOf(AssetClass.BROKERAGE, AssetClass.CPF, AssetClass.CRYPTO, AssetClass.GOLD)) {
                return BudgetType.SAVINGS
            }

            // All other own-account transfers = EXCLUDED
            if (toCategory == AccountCategory.ASSET) return BudgetType.EXCLUDED
        }

        // Transfer to external LIABILITY (loan repayment) = prefill NEED
        if (toAccount?.accountType?.category == AccountCategory.LIABILITY) return BudgetType.NEED

        return null // fallback — user must tag
    }

    private fun applyBalanceChanges(
        flow: TransactionFlow,
        fromAccount: Account?,
        toAccount: Account?,
        amount: BigDecimal,
    ) {
        fromAccount?.let {
            it.currentBalance -= amount
            accountRepository.save(it)
        }
        toAccount?.let {
            it.currentBalance += amount
            accountRepository.save(it)
        }
    }

    private fun reverseBalanceChanges(
        flow: TransactionFlow,
        fromAccount: Account?,
        toAccount: Account?,
        amount: BigDecimal,
    ) {
        fromAccount?.let {
            it.currentBalance += amount
            accountRepository.save(it)
        }
        toAccount?.let {
            it.currentBalance -= amount
            accountRepository.save(it)
        }
    }

    // Add this method to TransactionService.kt

    @Transactional
    override fun updateTransaction(
        userId: String,
        transactionId: String,
        request: TransactionUpdateRequest,
    ): TransactionResponse {
        val tx = transactionRepository.findByIdAndUserId(transactionId, userId)
            ?: throw AppException.Forbidden("Transaction not found or access denied")

        if (tx.status == TransactionStatus.VOID) {
            throw AppException.BadRequest("Cannot update a voided transaction")
        }

        val category = request.categoryId?.let {
            categoryRepository.findById(it)
                .orElseThrow { AppException.NotFound("Category not found") }
        } ?: tx.category

        val merchant = request.merchantId?.let {
            merchantRepository.findById(it).orElse(null)
        } ?: tx.merchant

        // If budget type not explicitly provided, re-derive from new category
        val resolvedBudgetType = request.budgetType
            ?: category?.budgetType
            ?: tx.budgetType

        val updated = tx.copy(
            category = category,
            merchant = merchant,
            budgetType = resolvedBudgetType,
            description = request.description ?: tx.description,
            remarks = request.remarks ?: tx.remarks,
            transactionDate = request.transactionDate ?: tx.transactionDate,
            status = request.status ?: tx.status,
            updatedAt = java.time.LocalDateTime.now(),
        )

        return TransactionResponse.from(transactionRepository.save(updated))
    }
}