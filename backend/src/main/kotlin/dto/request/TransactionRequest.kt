package com.finance.dto.request

import com.finance.constants.BudgetType
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDate

data class TransactionRequest(
    val fromAccountId: String? = null,
    val toAccountId: String? = null,

    @field:NotNull(message = "Transaction type is required")
    val transactionTypeId: Int,

    val categoryId: Int? = null,
    val merchantId: Int? = null,

    @field:NotNull(message = "Transaction date is required")
    val transactionDate: LocalDate,

    val description: String? = null,
    val referenceNumber: String? = null,

    @field:NotNull(message = "Amount is required")
    @field:Positive(message = "Amount must be positive")
    val amount: BigDecimal,

    @field:NotNull(message = "Currency is required")
    val currencyCode: String,

    val exchangeRate: BigDecimal = BigDecimal.ONE,
    val remarks: String? = null,
    val isRecurring: Boolean = false,
    val budgetType: BudgetType? = null,
)
