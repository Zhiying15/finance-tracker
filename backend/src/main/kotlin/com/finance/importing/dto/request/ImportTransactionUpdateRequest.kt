package com.finance.importing.dto.request

import com.finance.common.constants.BudgetType
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.LocalDate

data class ImportTransactionUpdateRequest(

    @field:NotNull(message = "Transaction date is required")
    val transactionDate: LocalDate,

    @field:Size(max = 500, message = "Description must not exceed 500 characters")
    val description: String? = null,

    @field:NotNull(message = "Amount is required")
    @field:DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    val amount: BigDecimal,

    @field:NotNull(message = "Flow direction is required")
    val isInflow: Boolean,

    @field:Size(min = 3, max = 3, message = "Currency code must be exactly 3 characters")
    val currency: String? = null,

    // User can pre-tag budget type during review
    val budgetType: BudgetType? = null,
)