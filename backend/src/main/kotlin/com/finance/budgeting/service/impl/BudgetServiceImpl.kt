package com.finance.budgeting.service.impl

import com.finance.account.repository.AccountRepository
import com.finance.budgeting.dto.request.BudgetUpsertRequest
import com.finance.budgeting.dto.response.BudgetHistoryResponse
import com.finance.budgeting.dto.response.BudgetResponse
import com.finance.budgeting.repository.BudgetRepository
import com.finance.budgeting.service.BudgetService
import com.finance.common.constants.BudgetType
import com.finance.entity.Budget
import com.finance.transaction.repository.TransactionRepository
import com.finance.common.exception.AppException
import com.finance.user.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth

@Service
class BudgetServiceImpl(
    private val budgetRepository: BudgetRepository,
    private val transactionRepository: TransactionRepository,
    private val accountRepository: AccountRepository,
    private val userRepository: UserRepository,
) : BudgetService {
    private val hundred = BigDecimal("100")
    private val defaultNeedPct    = BigDecimal("50.00")
    private val defaultWantPct    = BigDecimal("30.00")
    private val defaultSavingsPct = BigDecimal("20.00")

    // -----------------------------------------------
    // Upsert — create or update budget for a month
    // -----------------------------------------------

    @Transactional
    override fun upsertBudget(userId: String, request: BudgetUpsertRequest): BudgetResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { AppException.NotFound("User not found") }

        validatePercentages(request)

        val budget = budgetRepository
            .findByUserIdAndYearAndMonth(userId, request.year, request.month)
            ?.apply {
                // Update existing — only replace fields that were provided
                request.needPercent?.let    { needPercent    = it }
                request.wantPercent?.let    { wantPercent    = it }
                request.savingsPercent?.let { savingsPercent = it }
                request.declaredIncome?.let { declaredIncome = it }
            }
            ?: Budget(
                user = user,
                year = request.year,
                month = request.month,
                needPercent = request.needPercent,
                wantPercent = request.wantPercent,
                savingsPercent = request.savingsPercent,
                declaredIncome = request.declaredIncome,
            )

        val saved = budgetRepository.save(budget)
        return buildFullResponse(saved, userId)
    }

    // -----------------------------------------------
    // Queries
    // -----------------------------------------------

    @Transactional(readOnly = true)
    override fun getBudget(userId: String, year: Int, month: Int): BudgetResponse {
        // If no budget configured for this month — return defaults with live summary
        val budget = budgetRepository.findByUserIdAndYearAndMonth(userId, year, month)
            ?: Budget(
                user = userRepository.findById(userId)
                    .orElseThrow { AppException.NotFound("User not found") },
                year = year,
                month = month,
                needPercent = defaultNeedPct,
                wantPercent = defaultWantPct,
                savingsPercent = defaultSavingsPct,
                declaredIncome = null,
            )

        return buildFullResponse(budget, userId)
    }

    @Transactional(readOnly = true)
    override fun getBudgetHistory(userId: String): List<BudgetHistoryResponse> =
        budgetRepository
            .findAllByUserIdOrderByYearDescMonthDesc(userId)
            .map { budget ->
                BudgetHistoryResponse(
                    id = budget.id,
                    year = budget.year,
                    month = budget.month,
                    period = "%04d-%02d".format(budget.year, budget.month),
                    needPercent = budget.needPercent,
                    wantPercent = budget.wantPercent,
                    savingsPercent = budget.savingsPercent,
                    declaredIncome = budget.declaredIncome,
                    updatedAt = budget.updatedAt,
                )
            }

    @Transactional
    override fun deleteBudget(userId: String, year: Int, month: Int) {
        val budget = budgetRepository.findByUserIdAndYearAndMonth(userId, year, month)
            ?: throw AppException.NotFound("No budget configured for %04d-%02d".format(year, month))

        if (budget.user.id != userId) throw AppException.Forbidden("Access denied")

        budgetRepository.delete(budget)
    }

    // -----------------------------------------------
    // Core — full budget response builder
    // -----------------------------------------------

    private fun buildFullResponse(budget: Budget, userId: String): BudgetResponse {
        val yearMonth = YearMonth.of(budget.year, budget.month)
        val from      = yearMonth.atDay(1)
        val to        = yearMonth.atEndOfMonth()

        // --- Percentages (use configured or system defaults) ---
        val needPct    = budget.needPercent    ?: defaultNeedPct
        val wantPct    = budget.wantPercent    ?: defaultWantPct
        val savingsPct = budget.savingsPercent ?: defaultSavingsPct

        // --- Actual income ---
        val actualIncome = transactionRepository.sumByBudgetTypeAndPeriod(
            userId, BudgetType.INCOME, from, to
        )

        // --- Forecasted income: declared → 3-month rolling average ---
        val forecastedIncome = budget.declaredIncome
            ?: transactionRepository.rollingAverageIncome(
                userId,
                fromDate = LocalDate.of(budget.year, budget.month, 1).minusMonths(3)
            )

        // --- Actual spend per bucket ---
        val actualNeed    = transactionRepository.sumByBudgetTypeAndPeriod(userId, BudgetType.NEED,    from, to)
        val actualWant    = transactionRepository.sumByBudgetTypeAndPeriod(userId, BudgetType.WANT,    from, to)
        val actualSavings = transactionRepository.sumByBudgetTypeAndPeriod(userId, BudgetType.SAVINGS, from, to)

        // --- Allocated = configured_percent * actual income ---
        val allocatedNeed    = actualIncome.multiply(needPct).divide(hundred, 2, RoundingMode.HALF_UP)
        val allocatedWant    = actualIncome.multiply(wantPct).divide(hundred, 2, RoundingMode.HALF_UP)
        val allocatedSavings = actualIncome.multiply(savingsPct).divide(hundred, 2, RoundingMode.HALF_UP)

        // --- Forecasted spend = configured_percent * forecasted income ---
        val forecastNeed    = forecastedIncome.multiply(needPct).divide(hundred, 2, RoundingMode.HALF_UP)
        val forecastWant    = forecastedIncome.multiply(wantPct).divide(hundred, 2, RoundingMode.HALF_UP)
        val forecastSavings = forecastedIncome.multiply(savingsPct).divide(hundred, 2, RoundingMode.HALF_UP)

        // --- Spare cash ---
        val actualSpare    = actualIncome - actualNeed - actualWant - actualSavings
        val forecastedSpare = forecastedIncome - forecastNeed - forecastWant - forecastSavings

        // --- Totals ---
        val totalActualSpend   = actualNeed + actualWant + actualSavings
        val totalBudgetedSpend = allocatedNeed + allocatedWant + allocatedSavings

        // --- Net worth snapshot ---
        val totalAssets      = accountRepository.sumAssetBalance(userId)
        val totalLiabilities = accountRepository.sumLiabilityBalance(userId)

        // --- Safe percent calculation helper ---
        fun percentOf(part: BigDecimal, whole: BigDecimal): BigDecimal? =
            if (whole.compareTo(BigDecimal.ZERO) == 0) null
            else part.multiply(hundred).divide(whole, 2, RoundingMode.HALF_UP)

        fun percentConsumed(actual: BigDecimal, allocated: BigDecimal): BigDecimal? =
            if (allocated.compareTo(BigDecimal.ZERO) == 0) null
            else actual.multiply(hundred).divide(allocated, 2, RoundingMode.HALF_UP)

        return BudgetResponse(
            id = budget.id,
            year = budget.year,
            month = budget.month,
            period = "%04d-%02d".format(budget.year, budget.month),
            needPercent = budget.needPercent,
            wantPercent = budget.wantPercent,
            savingsPercent = budget.savingsPercent,
            totalAllocatedPercent = listOfNotNull(
                budget.needPercent,
                budget.wantPercent,
                budget.savingsPercent,
            ).takeIf { it.isNotEmpty() }?.reduce { a, b -> a + b },
            declaredIncome = budget.declaredIncome,
            createdAt = budget.createdAt,
            updatedAt = budget.updatedAt,
            summary = BudgetResponse.MonthlySummary(
                actualIncome = actualIncome,
                forecastedIncome = forecastedIncome,
                need = BudgetResponse.BudgetLine(
                    budgetType = BudgetType.NEED,
                    actual = actualNeed,
                    percentOfActualIncome = percentOf(actualNeed, actualIncome),
                    budgetAllocated = allocatedNeed,
                    forecasted = forecastNeed,
                    variance = allocatedNeed - actualNeed,
                    percentConsumed = percentConsumed(actualNeed, allocatedNeed),
                ),
                want = BudgetResponse.BudgetLine(
                    budgetType = BudgetType.WANT,
                    actual = actualWant,
                    percentOfActualIncome = percentOf(actualWant, actualIncome),
                    budgetAllocated = allocatedWant,
                    forecasted = forecastWant,
                    variance = allocatedWant - actualWant,
                    percentConsumed = percentConsumed(actualWant, allocatedWant),
                ),
                savings = BudgetResponse.BudgetLine(
                    budgetType = BudgetType.SAVINGS,
                    actual = actualSavings,
                    percentOfActualIncome = percentOf(actualSavings, actualIncome),
                    budgetAllocated = allocatedSavings,
                    forecasted = forecastSavings,
                    variance = allocatedSavings - actualSavings,
                    percentConsumed = percentConsumed(actualSavings, allocatedSavings),
                ),
                totalActualSpend = totalActualSpend,
                totalBudgetedSpend = totalBudgetedSpend,
                actualSpareCash = actualSpare,
                forecastedSpareCash = forecastedSpare,
                netWorth = BudgetResponse.NetWorthSnapshot(
                    totalAssets = totalAssets,
                    totalLiabilities = totalLiabilities,
                    net = totalAssets - totalLiabilities,
                ),
            ),
        )
    }

    // -----------------------------------------------
    // Validation
    // -----------------------------------------------

    private fun validatePercentages(request: BudgetUpsertRequest) {
        val provided = listOfNotNull(
            request.needPercent,
            request.wantPercent,
            request.savingsPercent,
        )

        // Only validate total if all three are provided — allow partial updates
        if (provided.size == 3) {
            val total = provided.reduce { a, b -> a + b }
            if (total > hundred) {
                throw AppException.BadRequest(
                    "Budget percentages must not exceed 100% — " +
                            "provided total: ${total.toPlainString()}%"
                )
            }
        }
    }
}