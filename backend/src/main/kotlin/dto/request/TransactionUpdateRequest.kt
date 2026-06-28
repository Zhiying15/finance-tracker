package com.finance.dto.request

import com.finance.constants.BudgetType
import com.finance.constants.TransactionStatus
import java.math.BigDecimal
import java.time.LocalDate

data class TransactionUpdateRequest(
    val categoryId: Int? = null,
    val merchantId: Int? = null,
    val budgetType: BudgetType? = null,
    val description: String? = null,
    val remarks: String? = null,
    val transactionDate: LocalDate? = null,
    val amount: BigDecimal? = null,
    val status: TransactionStatus? = null,
)
