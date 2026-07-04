package transaction.dto.request

import common.constants.BudgetType
import common.constants.TransactionFlow
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size
import java.math.BigDecimal
import java.time.LocalDate

data class TransactionRequest(

    // For OUTFLOW: fromAccountId required, toAccountId null
    // For INFLOW:  toAccountId required, fromAccountId null
    // For TRANSFER: both required
    val fromAccountId: String? = null,
    val toAccountId: String? = null,

    @field:NotNull(message = "Transaction flow is required")
    val transactionFlow: TransactionFlow,

    @field:NotNull(message = "Transaction date is required")
    val transactionDate: LocalDate,

    @field:Size(max = 500, message = "Description must not exceed 500 characters")
    val description: String? = null,

    @field:NotNull(message = "Amount is required")
    @field:DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    val amount: BigDecimal,

    @field:NotNull(message = "Currency code is required")
    @field:Size(min = 3, max = 3, message = "Currency code must be exactly 3 characters")
    val currencyCode: String,

    val exchangeRate: BigDecimal = BigDecimal.ONE,

    @field:Size(max = 500, message = "Remarks must not exceed 500 characters")
    val remarks: String? = null,

    val isRecurring: Boolean = false,

    // If null — service will attempt to derive from account type (TRANSFER rules)
    val budgetType: BudgetType? = null,
)
