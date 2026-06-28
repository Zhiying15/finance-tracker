package com.finance.controller

import com.finance.dto.request.CreateCategoryRequest
import com.finance.dto.response.CategoryResponse
import com.finance.service.CategoryService
import com.finance.utility.SecurityUtils
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import jakarta.servlet.http.HttpSession
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/finance-tracker/category")
class CategoryController(private val categoryService: CategoryService) {

    @GetMapping
    fun listCategories(session: HttpSession?): ResponseEntity<List<CategoryResponse>> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(categoryService.listCategoriesForUser(user.userId))
    }

    @PostMapping
    fun createCategory(
        session: HttpSession?,
        @RequestBody request: CreateCategoryRequest,
    ): ResponseEntity<CategoryResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        val created = categoryService.createUserCategory(
            userId = user.userId,
            name = request.name,
            budgetType = request.budgetType,
            parentId = request.parentId,
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    @DeleteMapping("/{categoryId}")
    fun deleteCategory(
        session: HttpSession?,
        @PathVariable categoryId: Int,
    ): ResponseEntity<Unit> {
        val user = SecurityUtils.resolveCurrentUser(session)
        categoryService.deleteUserCategory(user.userId, categoryId)
        return ResponseEntity.noContent().build()
    }
}