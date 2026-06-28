package com.finance.controller

import com.finance.dto.request.BudgetRequest
import com.finance.dto.response.MonthlySummaryResponse
import com.finance.service.BudgetService
import com.finance.utility.SecurityUtils
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/budget")
class BudgetController(private val budgetService: BudgetService) {

    @PutMapping
    fun upsertBudget(
        session: HttpSession?,
        @Valid @RequestBody request: BudgetRequest,
    ): ResponseEntity<Unit> {
        val user = SecurityUtils.resolveCurrentUser(session)
        budgetService.upsertBudget(user.userId, request)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/summary")
    fun getMonthlySummary(
        session: HttpSession?,
        @RequestParam year: Int,
        @RequestParam month: Int,
    ): ResponseEntity<MonthlySummaryResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(budgetService.getMonthlySummary(user.userId, year, month))
    }
}