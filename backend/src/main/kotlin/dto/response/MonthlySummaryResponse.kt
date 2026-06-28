package com.finance.dto.response

import java.math.BigDecimal

data class MonthlySummaryResponse(
    val period: String,
    val income: IncomeBreakdown,
    val spending: SpendingBreakdown,
    val spareCash: SpareCash,
    val netWorth: NetWorth,
) {
    data class IncomeBreakdown(
        val actual: BigDecimal,
        val forecasted: BigDecimal,
    )

    data class SpendingBreakdown(
        val need: BudgetLine,
        val want: BudgetLine,
        val savings: BudgetLine,
    )

    data class BudgetLine(
        val actual: BigDecimal,
        val budgetAllocated: BigDecimal,
        val forecasted: BigDecimal,
    )

    data class SpareCash(
        val actual: BigDecimal,
        val forecasted: BigDecimal,
    )

    data class NetWorth(
        val totalAssets: BigDecimal,
        val totalLiabilities: BigDecimal,
        val net: BigDecimal,
    )
}
