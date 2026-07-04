package com.financebudgeting.dto.response

import java.math.BigDecimal
import java.time.LocalDateTime

data class BudgetHistoryResponse(
    val id: String,
    val year: Int,
    val month: Int,
    val period: String,
    val needPercent: BigDecimal?,
    val wantPercent: BigDecimal?,
    val savingsPercent: BigDecimal?,
    val declaredIncome: BigDecimal?,
    val updatedAt: LocalDateTime,
)
