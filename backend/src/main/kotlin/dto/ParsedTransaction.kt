package com.finance.dto

import java.math.BigDecimal
import java.time.LocalDate

data class ParsedTransaction(
    val transactionDate: LocalDate?,
    val description: String?,
    val amount: BigDecimal?,
    val isInflow: Boolean?,
    val referenceNumber: String?,
    val currency: String?,
)
