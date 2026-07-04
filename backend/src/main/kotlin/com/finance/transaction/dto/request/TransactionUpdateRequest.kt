package com.financetransaction.dto.request


import common.constants.BudgetType
import jakarta.validation.constraints.Size
import java.time.LocalDate

data class TransactionUpdateRequest(

    val transactionDate: LocalDate? = null,

    @field:Size(max = 500, message = "Description must not exceed 500 characters")
    val description: String? = null,

    @field:Size(max = 500, message = "Remarks must not exceed 500 characters")
    val remarks: String? = null,

    // Budget type is the primary field users correct post-import
    val budgetType: BudgetType? = null,

    val isRecurring: Boolean? = null,
)
