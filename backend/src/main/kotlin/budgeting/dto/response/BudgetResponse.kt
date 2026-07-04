package budgeting.dto.response

import common.constants.BudgetType
import entity.Budget
import java.math.BigDecimal
import java.time.LocalDateTime

data class BudgetResponse(
    val id: String,
    val year: Int,
    val month: Int,
    val period: String,

    // Configured budget percentages — null means not yet set by user
    val needPercent: BigDecimal?,
    val wantPercent: BigDecimal?,
    val savingsPercent: BigDecimal?,

    // Sum of all percentages — UI can warn if not 100%
    val totalAllocatedPercent: BigDecimal?,

    // Declared income — null means system will use rolling average
    val declaredIncome: BigDecimal?,

    // Full monthly breakdown — actual vs budget vs forecast
    val summary: MonthlySummary,

    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {
    data class MonthlySummary(
        // Income
        val actualIncome: BigDecimal,
        val forecastedIncome: BigDecimal,

        // Spend buckets
        val need: BudgetLine,
        val want: BudgetLine,
        val savings: BudgetLine,

        // Totals
        val totalActualSpend: BigDecimal,
        val totalBudgetedSpend: BigDecimal,

        // Spare cash
        val actualSpareCash: BigDecimal,
        val forecastedSpareCash: BigDecimal,

        // Net worth snapshot
        val netWorth: NetWorthSnapshot,
    )

    data class BudgetLine(
        val budgetType: BudgetType,

        // Raw actuals from transactions
        val actual: BigDecimal,

        // Percent of actual income
        val percentOfActualIncome: BigDecimal?,

        // Budget allocated = configured_percent * actual_income
        val budgetAllocated: BigDecimal,

        // Forecasted spend = configured_percent * forecasted_income
        val forecasted: BigDecimal,

        // Positive = under budget, negative = over budget
        val variance: BigDecimal,

        // Percentage consumed of budget (e.g. 82.5%)
        val percentConsumed: BigDecimal?,
    )

    data class NetWorthSnapshot(
        val totalAssets: BigDecimal,
        val totalLiabilities: BigDecimal,
        val net: BigDecimal,
    )

    companion object {
        fun from(entity: Budget) = BudgetResponse(
            id = entity.id,
            year = entity.year,
            month = entity.month,
            period = "%04d-%02d".format(entity.year, entity.month),
            needPercent = entity.needPercent,
            wantPercent = entity.wantPercent,
            savingsPercent = entity.savingsPercent,
            totalAllocatedPercent = listOfNotNull(
                entity.needPercent,
                entity.wantPercent,
                entity.savingsPercent,
            ).takeIf { it.isNotEmpty() }?.reduce { a, b -> a + b },
            declaredIncome = entity.declaredIncome,
            // summary is populated by BudgetService — placeholder needed for compiler
            summary = MonthlySummary(
                actualIncome = BigDecimal.ZERO,
                forecastedIncome = BigDecimal.ZERO,
                need = BudgetLine(BudgetType.NEED, BigDecimal.ZERO, null,
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, null),
                want = BudgetLine(BudgetType.WANT, BigDecimal.ZERO, null,
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, null),
                savings = BudgetLine(BudgetType.SAVINGS, BigDecimal.ZERO, null,
                    BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, null),
                totalActualSpend = BigDecimal.ZERO,
                totalBudgetedSpend = BigDecimal.ZERO,
                actualSpareCash = BigDecimal.ZERO,
                forecastedSpareCash = BigDecimal.ZERO,
                netWorth = NetWorthSnapshot(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO),
            ),
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
        )
    }
}
