package com.financeaccount.dto.response

import java.math.BigDecimal

data class NetWorthResponse(
    val totalAssets: BigDecimal,
    val totalLiabilities: BigDecimal,
    val netWorth: BigDecimal,
    val breakdown: List<AssetClassBreakdown>,
) {
    data class AssetClassBreakdown(
        val assetClass: String,
        val category: String,
        val totalBalance: BigDecimal,
        val accounts: List<AccountResponse>,
    )
}
