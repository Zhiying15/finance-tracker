package importing.dto

import java.math.BigDecimal
import java.time.LocalDate

data class ParsedTransactionFields(
    val transactionDate: LocalDate?,
    val description: String?,
    val amount: BigDecimal?,
    val isInflow: Boolean?,
    val currency: String?,
)