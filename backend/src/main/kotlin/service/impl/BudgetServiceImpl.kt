package com.finance.service.impl

import com.finance.constants.BudgetType
import com.finance.dto.request.BudgetRequest
import com.finance.dto.response.MonthlySummaryResponse
import com.finance.entity.Budget
import com.finance.repository.AccountRepository
import com.finance.repository.BudgetRepository
import com.finance.repository.TransactionRepository
import com.finance.repository.UserRepository
import com.finance.exception.AppException
import com.finance.service.BudgetService
import org.slf4j.LoggerFactory
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

    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional
    override fun upsertBudget(userId: String, request: BudgetRequest): Budget {
        val user = userRepository.findById(userId).orElseThrow { AppException.NotFound("User not found") }

        val existing = budgetRepository.findByUserIdAndYearAndMonth(userId, request.year, request.month)

        return if (existing != null) {
            budgetRepository.save(
                existing.copy(
                    needPercent = request.needPercent,
                    wantPercent = request.wantPercent,
                    savingsPercent = request.savingsPercent,
                    declaredIncome = request.declaredIncome,
                    updatedAt = java.time.LocalDateTime.now(),
                )
            )
        } else {
            budgetRepository.save(
                Budget(
                    user = user,
                    year = request.year,
                    month = request.month,
                    needPercent = request.needPercent,
                    wantPercent = request.wantPercent,
                    savingsPercent = request.savingsPercent,
                    declaredIncome = request.declaredIncome,
                )
            )
        }
    }

    @Transactional(readOnly = true)
    override fun getMonthlySummary(userId: String, year: Int, month: Int): MonthlySummaryResponse {
        val budget = budgetRepository.findByUserIdAndYearAndMonth(userId, year, month)

        // --- Actual income ---
        val actualIncome = transactionRepository.sumMonthlyIncome(userId, year, month)

        // --- Forecasted income: declared → fallback 3-month rolling avg ---
        val forecastedIncome = budget?.declaredIncome
            ?: run {
                val threeMonthsAgo = LocalDate.of(year, month, 1).minusMonths(3)
                transactionRepository.rollingAverageIncome(userId, threeMonthsAgo)
            }

        // --- Budget percentages (use stored or sensible defaults 50/30/20) ---
        val needPct = budget?.needPercent ?: BigDecimal("50.00")
        val wantPct = budget?.wantPercent ?: BigDecimal("30.00")
        val savingsPct = budget?.savingsPercent ?: BigDecimal("20.00")

        val hundred = BigDecimal("100")

        // --- Actual spending by bucket ---
        val actualNeed = transactionRepository.sumMonthlyByBudgetType(userId, BudgetType.NEED, year, month)
        val actualWant = transactionRepository.sumMonthlyByBudgetType(userId, BudgetType.WANT, year, month)
        val actualSavings = transactionRepository.sumMonthlyByBudgetType(userId, BudgetType.SAVINGS, year, month)

        // --- Budget allocated = percent * actual income ---
        val budgetNeed = actualIncome.multiply(needPct).divide(hundred, 2, RoundingMode.HALF_UP)
        val budgetWant = actualIncome.multiply(wantPct).divide(hundred, 2, RoundingMode.HALF_UP)
        val budgetSavings = actualIncome.multiply(savingsPct).divide(hundred, 2, RoundingMode.HALF_UP)

        // --- Forecasted spend = forecasted income * avg actual % ---
        val forecastNeed = forecastedIncome.multiply(needPct).divide(hundred, 2, RoundingMode.HALF_UP)
        val forecastWant = forecastedIncome.multiply(wantPct).divide(hundred, 2, RoundingMode.HALF_UP)
        val forecastSavings = forecastedIncome.multiply(savingsPct).divide(hundred, 2, RoundingMode.HALF_UP)

        // --- Spare cash ---
        val actualSpare = actualIncome - actualNeed - actualWant - actualSavings
        val forecastedSpare = forecastedIncome - forecastNeed - forecastWant - forecastSavings

        // --- Net worth ---
        val totalAssets = accountRepository.sumAssetBalanceByUserId(userId)
        val totalLiabilities = accountRepository.sumLiabilityBalanceByUserId(userId)

        return MonthlySummaryResponse(
            period = "%04d-%02d".format(year, month),
            income = MonthlySummaryResponse.IncomeBreakdown(
                actual = actualIncome,
                forecasted = forecastedIncome,
            ),
            spending = MonthlySummaryResponse.SpendingBreakdown(
                need = MonthlySummaryResponse.BudgetLine(actualNeed, budgetNeed, forecastNeed),
                want = MonthlySummaryResponse.BudgetLine(actualWant, budgetWant, forecastWant),
                savings = MonthlySummaryResponse.BudgetLine(actualSavings, budgetSavings, forecastSavings),
            ),
            spareCash = MonthlySummaryResponse.SpareCash(actualSpare, forecastedSpare),
            netWorth = MonthlySummaryResponse.NetWorth(totalAssets, totalLiabilities, totalAssets - totalLiabilities),
        )
    }
}