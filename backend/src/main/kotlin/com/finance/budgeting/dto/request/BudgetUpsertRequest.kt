package com.financebudgeting.dto.request

import jakarta.validation.constraints.DecimalMax
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal

data class BudgetUpsertRequest(

    @field:NotNull(message = "Year is required")
    @field:Min(value = 2000, message = "Year must be 2000 or later")
    @field:Max(value = 2100, message = "Year must be 2100 or earlier")
    val year: Int,

    @field:NotNull(message = "Month is required")
    @field:Min(value = 1, message = "Month must be between 1 and 12")
    @field:Max(value = 12, message = "Month must be between 1 and 12")
    val month: Int,

    @field:DecimalMin(value = "0.00", message = "Need percent must be 0 or greater")
    @field:DecimalMax(value = "100.00", message = "Need percent must be 100 or less")
    val needPercent: BigDecimal? = null,

    @field:DecimalMin(value = "0.00", message = "Want percent must be 0 or greater")
    @field:DecimalMax(value = "100.00", message = "Want percent must be 100 or less")
    val wantPercent: BigDecimal? = null,

    @field:DecimalMin(value = "0.00", message = "Savings percent must be 0 or greater")
    @field:DecimalMax(value = "100.00", message = "Savings percent must be 100 or less")
    val savingsPercent: BigDecimal? = null,

    @field:DecimalMin(value = "0.00", message = "Declared income must be 0 or greater")
    val declaredIncome: BigDecimal? = null,
)