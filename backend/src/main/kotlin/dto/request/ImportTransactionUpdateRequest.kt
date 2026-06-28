package com.finance.dto.request

import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDate

data class ImportTransactionUpdateRequest(
    @field:NotNull(message = "Transaction date is required")
    val transactionDate: LocalDate,

    val description: String?,

    @field:NotNull(message = "Amount is required")
    @field:Positive(message = "Amount must be positive")
    val amount: BigDecimal,

    @field:NotNull(message = "Flow direction is required")
    val isInflow: Boolean,

    val referenceNumber: String?,
    val currency: String?,
)
