package com.finance.service.impl

import com.finance.constants.BudgetType
import com.finance.dto.response.CategoryResponse
import com.finance.entity.Category
import com.finance.exception.AppException
import com.finance.repository.CategoryRepository
import com.finance.repository.UserRepository
import com.finance.service.CategoryService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class CategoryServiceImpl(
    private val categoryRepository: CategoryRepository,
    private val userRepository: UserRepository,
) : CategoryService {

    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional(readOnly = true)
    override fun listCategoriesForUser(userId: String): List<CategoryResponse> =
        categoryRepository.findAllForUser(userId).map { CategoryResponse.from(it) }

    @Transactional
    override fun createUserCategory(
        userId: String,
        name: String,
        budgetType: BudgetType?,
        parentId: Int?,
    ): CategoryResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { AppException.NotFound("User not found") }

        val parent = parentId?.let {
            categoryRepository.findById(it)
                .orElseThrow { AppException.NotFound("Parent category not found") }
        }

        // Prevent user from shadowing system categories with identical names
        val existingNames = categoryRepository.findAllForUser(userId)
            .map { it.name.lowercase() }

        if (name.lowercase() in existingNames) {
            throw AppException.Conflict("A category with name '$name' already exists")
        }

        val entity = Category(
            user = user,
            parent = parent,
            name = name.trim(),
            budgetType = budgetType,
        )

        return CategoryResponse.from(categoryRepository.save(entity))
    }

    @Transactional
    override fun deleteUserCategory(userId: String, categoryId: Int) {
        val category = categoryRepository.findById(categoryId)
            .orElseThrow { AppException.NotFound("Category not found") }

        // Guard: cannot delete system categories (user_id = null)
        if (category.user == null) {
            throw AppException.Forbidden("System categories cannot be deleted")
        }

        if (category.user.id != userId) {
            throw AppException.Forbidden("Access denied")
        }

        categoryRepository.deleteById(categoryId)
    }
}