package transaction.dto.response

import common.constants.BudgetType
import java.math.BigDecimal

data class TransactionSummaryResponse(
    val period: String,             // "2025-06"
    val income: BigDecimal,
    val forecastedIncome: BigDecimal,
    val spending: SpendingBreakdown,
    val spareCash: SpareCash,
    val netWorth: NetWorthSummary,
) {
    data class SpendingBreakdown(
        val need: BudgetLine,
        val want: BudgetLine,
        val savings: BudgetLine,
        val total: BigDecimal,
    )

    data class BudgetLine(
        val budgetType: BudgetType,
        val actual: BigDecimal,
        val budgetAllocated: BigDecimal,    // percent * actual income
        val forecasted: BigDecimal,          // percent * forecasted income
        val variance: BigDecimal,            // budgetAllocated - actual (positive = under budget)
    )

    data class SpareCash(
        val actual: BigDecimal,
        val forecasted: BigDecimal,
    )

    data class NetWorthSummary(
        val totalAssets: BigDecimal,
        val totalLiabilities: BigDecimal,
        val net: BigDecimal,
    )
}
