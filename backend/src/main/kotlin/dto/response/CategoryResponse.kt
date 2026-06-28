package com.finance.dto.response

import com.finance.constants.BudgetType
import com.finance.entity.Category


data class CategoryResponse(
    val id: Int,
    val name: String,
    val budgetType: BudgetType?,
    val parentId: Int?,
    val parentName: String?,
    val isSystemDefault: Boolean,
) {
    companion object {
        fun from(entity: Category) = CategoryResponse(
            id = entity.id,
            name = entity.name,
            budgetType = entity.budgetType,
            parentId = entity.parent?.id,
            parentName = entity.parent?.name,
            isSystemDefault = entity.user == null,
        )
    }
}