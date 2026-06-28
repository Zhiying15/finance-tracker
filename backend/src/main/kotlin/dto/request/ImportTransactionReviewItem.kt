package com.finance.dto.request

import com.finance.constants.ReviewStatus
import java.math.BigDecimal
import java.time.LocalDate

data class ImportTransactionReviewItem(
    val id: String,
    val reviewStatus: ReviewStatus,
    val approved: Boolean,
    val parseError: String?,
    val parsedData: ParsedData?,
) {
    data class ParsedData(
        val transactionDate: LocalDate?,
        val description: String?,
        val amount: BigDecimal?,
        val isInflow: Boolean?,
        val referenceNumber: String?,
        val currency: String?,
    )
}
