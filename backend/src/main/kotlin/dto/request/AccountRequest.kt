package com.finance.dto.request

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.math.BigDecimal
import java.time.LocalDate

data class AccountRequest(
    @field:NotNull(message = "Account type is required")
    val accountTypeId: Int,

    @field:NotBlank(message = "Account name is required")
    val name: String,

    val institution: String? = null,
    val accountNumber: String? = null,

    @field:NotBlank(message = "Currency code is required")
    val currencyCode: String,

    val currentBalance: BigDecimal = BigDecimal.ZERO,
    val manualValuation: Boolean = false,
    val lastValuationDate: LocalDate? = null,
    val includeInNetWorth: Boolean = true,
    val notes: String? = null,
)
