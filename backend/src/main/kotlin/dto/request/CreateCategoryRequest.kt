package com.finance.dto.request

data class CreateCategoryRequest(
    val name: String,
    val budgetType: BudgetType? = null,
    val parentId: Int? = null,
)
