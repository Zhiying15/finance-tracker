package com.finance.dto.request

import com.finance.constants.BudgetType

data class CreateCategoryRequest(
    val name: String,
    val budgetType: BudgetType? = null,
    val parentId: Int? = null,
)
