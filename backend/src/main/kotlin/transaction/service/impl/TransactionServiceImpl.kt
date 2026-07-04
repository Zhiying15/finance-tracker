package transaction.service.impl

import com.finance.account.service.AccountService
import budgeting.repository.BudgetRepository
import common.constants.AccountCategory
import common.constants.AssetClass
import common.constants.BudgetType
import common.constants.TransactionFlow
import transaction.dto.request.TransactionRequest
import transaction.dto.request.TransactionUpdateRequest
import transaction.dto.response.TransactionResponse
import transaction.dto.response.TransactionSummaryResponse
import entity.Account
import entity.Transaction
import common.exception.AppException
import account.repository.AccountRepository
import transaction.repository.TransactionRepository
import transaction.service.TransactionService
import user.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import kotlin.collections.contains

@Service
class TransactionServiceImpl(
    private val transactionRepository: TransactionRepository,
    private val accountRepository: AccountRepository,
    private val accountService: AccountService,
    private val budgetRepository: BudgetRepository,
    private val userRepository: UserRepository,
) : TransactionService {

    // -----------------------------------------------
    // Queries
    // -----------------------------------------------

    @Transactional(readOnly = true)
    override fun listTransactions(userId: String): List<TransactionResponse> =
        transactionRepository
            .findAllByUserIdOrderByTransactionDateDescCreatedAtDesc(userId)
            .map { TransactionResponse.from(it) }

    @Transactional(readOnly = true)
    override fun listTransactionsByPeriod(
        userId: String,
        year: Int,
        month: Int,
    ): List<TransactionResponse> {
        val (from, to) = periodBounds(year, month)
        return transactionRepository
            .findAllByUserIdAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
                userId, from, to
            )
            .map { TransactionResponse.from(it) }
    }

    @Transactional(readOnly = true)
    override fun listTransactionsByAccount(
        userId: String,
        accountId: String,
    ): List<TransactionResponse> {
        // BOLA check — confirms account belongs to user before listing its transactions
        accountService.findOwnedAccount(userId, accountId)
        return transactionRepository
            .findAllByUserIdAndAccountId(userId, accountId)
            .map { TransactionResponse.from(it) }
    }

    @Transactional(readOnly = true)
    override fun getTransaction(userId: String, transactionId: String): TransactionResponse {
        val transaction = findOwnedTransaction(userId, transactionId)
        return TransactionResponse.from(transaction)
    }

    // -----------------------------------------------
    // Monthly Summary + Budget Engine
    // -----------------------------------------------

    @Transactional(readOnly = true)
    override fun getMonthlySummary(userId: String, year: Int, month: Int): TransactionSummaryResponse {
        val (from, to) = periodBounds(year, month)

        // Actual income for the month
        val actualIncome = transactionRepository.sumByBudgetTypeAndPeriod(
            userId, BudgetType.INCOME, from, to
        )

        // Forecasted income: declared → fallback 3-month rolling average
        val budget = budgetRepository.findByUserIdAndYearAndMonth(userId, year, month)
        val forecastedIncome = budget?.declaredIncome
            ?: transactionRepository.rollingAverageIncome(
                userId,
                fromDate = LocalDate.of(year, month, 1).minusMonths(3)
            )

        // Budget percentages — defaults to 50/30/20 if no budget configured
        val needPct    = budget?.needPercent    ?: BigDecimal("50.00")
        val wantPct    = budget?.wantPercent    ?: BigDecimal("30.00")
        val savingsPct = budget?.savingsPercent ?: BigDecimal("20.00")
        val hundred    = BigDecimal("100")

        // Actual spend per bucket
        val actualNeed    = transactionRepository.sumByBudgetTypeAndPeriod(userId, BudgetType.NEED,    from, to)
        val actualWant    = transactionRepository.sumByBudgetTypeAndPeriod(userId, BudgetType.WANT,    from, to)
        val actualSavings = transactionRepository.sumByBudgetTypeAndPeriod(userId, BudgetType.SAVINGS, from, to)

        // Budget allocated = percent * actual income
        val budgetNeed    = actualIncome.multiply(needPct).divide(hundred, 2, RoundingMode.HALF_UP)
        val budgetWant    = actualIncome.multiply(wantPct).divide(hundred, 2, RoundingMode.HALF_UP)
        val budgetSavings = actualIncome.multiply(savingsPct).divide(hundred, 2, RoundingMode.HALF_UP)

        // Forecasted spend = percent * forecasted income
        val forecastNeed    = forecastedIncome.multiply(needPct).divide(hundred, 2, RoundingMode.HALF_UP)
        val forecastWant    = forecastedIncome.multiply(wantPct).divide(hundred, 2, RoundingMode.HALF_UP)
        val forecastSavings = forecastedIncome.multiply(savingsPct).divide(hundred, 2, RoundingMode.HALF_UP)

        // Spare cash = income - (need + want + savings)
        val actualSpare    = actualIncome - actualNeed - actualWant - actualSavings
        val forecastedSpare = forecastedIncome - forecastNeed - forecastWant - forecastSavings

        // Net worth from account balances
        val totalAssets      = accountRepository.sumAssetBalance(userId)
        val totalLiabilities = accountRepository.sumLiabilityBalance(userId)

        return TransactionSummaryResponse(
            period = "%04d-%02d".format(year, month),
            income = actualIncome,
            forecastedIncome = forecastedIncome,
            spending = TransactionSummaryResponse.SpendingBreakdown(
                need = TransactionSummaryResponse.BudgetLine(
                    budgetType = BudgetType.NEED,
                    actual = actualNeed,
                    budgetAllocated = budgetNeed,
                    forecasted = forecastNeed,
                    variance = budgetNeed - actualNeed,
                ),
                want = TransactionSummaryResponse.BudgetLine(
                    budgetType = BudgetType.WANT,
                    actual = actualWant,
                    budgetAllocated = budgetWant,
                    forecasted = forecastWant,
                    variance = budgetWant - actualWant,
                ),
                savings = TransactionSummaryResponse.BudgetLine(
                    budgetType = BudgetType.SAVINGS,
                    actual = actualSavings,
                    budgetAllocated = budgetSavings,
                    forecasted = forecastSavings,
                    variance = budgetSavings - actualSavings,
                ),
                total = actualNeed + actualWant + actualSavings,
            ),
            spareCash = TransactionSummaryResponse.SpareCash(
                actual = actualSpare,
                forecasted = forecastedSpare,
            ),
            netWorth = TransactionSummaryResponse.NetWorthSummary(
                totalAssets = totalAssets,
                totalLiabilities = totalLiabilities,
                net = totalAssets - totalLiabilities,
            ),
        )
    }

    // -----------------------------------------------
    // Commands
    // -----------------------------------------------

    @Transactional
    override fun createManualTransaction(
        userId: String,
        request: TransactionRequest,
    ): TransactionResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { AppException.NotFound("User not found") }

        val fromAccount = request.fromAccountId?.let {
            accountService.findOwnedAccount(userId, it)
        }
        val toAccount = request.toAccountId?.let {
            accountService.findOwnedAccount(userId, it)
        }

        validateAccounts(request.transactionFlow, fromAccount, toAccount)

        val currency = transactionRepository.findCurrencyByCode(request.currencyCode)
            ?: throw AppException.NotFound("Currency '${request.currencyCode}' not found")

        // Resolve budget type: use provided → derive from transfer rules → null (user tags later)
        val resolvedBudgetType = request.budgetType
            ?: deriveTransferBudgetType(request.transactionFlow, fromAccount, toAccount)

        val transaction = Transaction(
            user = user,
            fromAccount = fromAccount,
            toAccount = toAccount,
            transactionFlow = request.transactionFlow,
            transactionDate = request.transactionDate,
            description = request.description?.trim(),
            amount = request.amount,
            currency = currency,
            exchangeRate = request.exchangeRate,
            remarks = request.remarks?.trim(),
            isManual = true,
            isRecurring = request.isRecurring,
            budgetType = resolvedBudgetType,
        )

        val saved = transactionRepository.save(transaction)

        // Immediately update account balances
        applyBalanceChange(request.transactionFlow, fromAccount, toAccount, request.amount)

        return TransactionResponse.from(saved)
    }

    @Transactional
    override fun updateTransaction(
        userId: String,
        transactionId: String,
        request: TransactionUpdateRequest,
    ): TransactionResponse {
        val transaction = findOwnedTransaction(userId, transactionId)

        // Apply only non-null fields — PATCH semantics
        request.transactionDate?.let { transaction.transactionDate = it }
        request.description?.let    { transaction.description = it.trim() }
        request.remarks?.let        { transaction.remarks = it.trim() }
        request.budgetType?.let     { transaction.budgetType = it }
        request.isRecurring?.let    { transaction.isRecurring = it }

        // @PreUpdate in BaseEntity handles updatedAt
        return TransactionResponse.from(transactionRepository.save(transaction))
    }

    @Transactional
    override fun deleteTransaction(userId: String, transactionId: String) {
        val transaction = findOwnedTransaction(userId, transactionId)

        // Reverse balance changes before deleting
        reverseBalanceChange(
            flow        = transaction.transactionFlow,
            fromAccount = transaction.fromAccount,
            toAccount   = transaction.toAccount,
            amount      = transaction.amount,
        )

        transactionRepository.delete(transaction)
    }

    // -----------------------------------------------
    // Internal — account validation
    // -----------------------------------------------

    private fun validateAccounts(
        flow: TransactionFlow,
        fromAccount: Account?,
        toAccount: Account?,
    ) {
        when (flow) {
            TransactionFlow.OUTFLOW -> {
                if (fromAccount == null) {
                    throw AppException.BadRequest("OUTFLOW transaction requires a from-account")
                }
                if (fromAccount.accountType.category == AccountCategory.EXTERNAL) {
                    throw AppException.BadRequest(
                        "OUTFLOW from-account cannot be an EXTERNAL account"
                    )
                }
            }
            TransactionFlow.INFLOW -> {
                if (toAccount == null) {
                    throw AppException.BadRequest("INFLOW transaction requires a to-account")
                }
                if (toAccount.accountType.category == AccountCategory.EXTERNAL) {
                    throw AppException.BadRequest(
                        "INFLOW to-account cannot be an EXTERNAL account"
                    )
                }
            }
            TransactionFlow.TRANSFER -> {
                if (fromAccount == null || toAccount == null) {
                    throw AppException.BadRequest(
                        "TRANSFER transaction requires both from-account and to-account"
                    )
                }
                if (fromAccount.id == toAccount.id) {
                    throw AppException.BadRequest(
                        "TRANSFER from-account and to-account must be different accounts"
                    )
                }
            }
        }
    }

    // -----------------------------------------------
    // Internal — budget type derivation for transfers
    // -----------------------------------------------

    private fun deriveTransferBudgetType(
        flow: TransactionFlow,
        fromAccount: Account?,
        toAccount: Account?,
    ): BudgetType? {
        if (flow != TransactionFlow.TRANSFER) return null

        val toAssetClass = toAccount?.accountType?.assetClass
        val toCategory   = toAccount?.accountType?.category

        return when {
            // Credit card payment → excluded (spending already captured at transaction level)
            toAssetClass == AssetClass.CREDIT_CARD -> BudgetType.EXCLUDED

            // Investment / retirement top-up → savings
            toAssetClass contains listOf(
                AssetClass.BROKERAGE,
                AssetClass.CPF,
                AssetClass.CRYPTO,
                AssetClass.GOLD,
                AssetClass.INSURANCE,
            ) -> BudgetType.SAVINGS

            // Loan repayment to external/liability party → need
            toCategory == AccountCategory.LIABILITY -> BudgetType.NEED

            // Transfer between own liquid accounts (bank → cash, bank → bank) → excluded
            toCategory == AccountCategory.ASSET -> BudgetType.EXCLUDED

            // Cannot derive — user must tag manually
            else -> null
        }
    }

    // -----------------------------------------------
    // Internal — balance management
    // -----------------------------------------------

    private fun applyBalanceChange(
        flow: TransactionFlow,
        fromAccount: Account?,
        toAccount: Account?,
        amount: BigDecimal,
    ) {
        fromAccount?.let {
            it.currentBalance = it.currentBalance - amount
            accountRepository.save(it)
        }
        toAccount?.let {
            it.currentBalance = it.currentBalance + amount
            accountRepository.save(it)
        }
    }

    private fun reverseBalanceChange(
        flow: TransactionFlow?,
        fromAccount: Account?,
        toAccount: Account?,
        amount: BigDecimal,
    ) {
        // Exact inverse of applyBalanceChange
        fromAccount?.let {
            it.currentBalance = it.currentBalance + amount
            accountRepository.save(it)
        }
        toAccount?.let {
            it.currentBalance = it.currentBalance - amount
            accountRepository.save(it)
        }
    }

    // -----------------------------------------------
    // Internal — helpers
    // -----------------------------------------------

    private fun findOwnedTransaction(userId: String, transactionId: String): Transaction =
        transactionRepository.findByIdAndUserId(transactionId, userId)
            ?: throw AppException.Forbidden("Transaction not found or access denied")

    private fun periodBounds(year: Int, month: Int): Pair<LocalDate, LocalDate> {
        val yearMonth = YearMonth.of(year, month)
        return Pair(yearMonth.atDay(1), yearMonth.atEndOfMonth())
    }
}