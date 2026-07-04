package com.finance.account.dto.request

import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.LocalDate

data class AccountRequest(

    @field:NotNull(message = "Account type is required")
    val accountTypeId: Int,

    @field:NotBlank(message = "Account name is required")
    @field:Size(max = 100, message = "Account name must not exceed 100 characters")
    val name: String,

    @field:Size(max = 100, message = "Institution must not exceed 100 characters")
    val institution: String? = null,

    @field:Size(max = 100, message = "Account number must not exceed 100 characters")
    val accountNumber: String? = null,

    @field:NotBlank(message = "Currency code is required")
    @field:Size(min = 3, max = 3, message = "Currency code must be exactly 3 characters")
    val currencyCode: String,

    @field:DecimalMin(value = "0.00", message = "Opening balance must be zero or greater")
    val openingBalance: BigDecimal = BigDecimal.ZERO,

    val manualValuation: Boolean = false,

    val lastValuationDate: LocalDate? = null,

    val includeInNetWorth: Boolean = true,

    @field:Size(max = 1000, message = "Notes must not exceed 1000 characters")
    val notes: String? = null,
)