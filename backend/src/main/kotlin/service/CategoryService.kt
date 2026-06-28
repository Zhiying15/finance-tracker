package com.finance.service

import com.finance.constants.BudgetType
import com.finance.dto.response.CategoryResponse
import org.springframework.stereotype.Service

@Service
interface CategoryService {
    fun listCategoriesForUser(userId: String): List<CategoryResponse>
    fun createUserCategory(
        userId: String,
        name: String,
        budgetType: BudgetType?,
        parentId: Int?,
    ): CategoryResponse
    fun deleteUserCategory(userId: String, categoryId: Int)
}