package account.dto.request

import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.LocalDate

data class AccountUpdateRequest(

    @field:Size(max = 100, message = "Account name must not exceed 100 characters")
    val name: String? = null,

    @field:Size(max = 100, message = "Institution must not exceed 100 characters")
    val institution: String? = null,

    @field:Size(max = 100, message = "Account number must not exceed 100 characters")
    val accountNumber: String? = null,

    val includeInNetWorth: Boolean? = null,

    val manualValuation: Boolean? = null,

    // Only applicable when manualValuation = true
    @field:DecimalMin(value = "0.00", message = "Manual balance must be zero or greater")
    val manualBalance: BigDecimal? = null,

    val lastValuationDate: LocalDate? = null,

    @field:Size(max = 1000, message = "Notes must not exceed 1000 characters")
    val notes: String? = null,
)
