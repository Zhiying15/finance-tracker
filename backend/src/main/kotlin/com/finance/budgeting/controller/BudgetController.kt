package com.finance.budgeting.controller

import com.finance.budgeting.dto.request.BudgetUpsertRequest
import com.finance.budgeting.dto.response.BudgetHistoryResponse
import com.finance.budgeting.dto.response.BudgetResponse
import com.finance.budgeting.service.BudgetService
import com.finance.common.utility.SecurityUtils
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/budget")
class BudgetController(
    private val budgetService: BudgetService,
) {

    // GET /api/budget?year=2025&month=6
    // Returns full budget config + live monthly summary
    // If no budget configured → returns defaults (50/30/20) + live actuals
    @GetMapping
    fun getBudget(
        session: HttpSession?,
        @RequestParam year: Int,
        @RequestParam month: Int,
    ): ResponseEntity<BudgetResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(budgetService.getBudget(user.userId, year, month))
    }

    // GET /api/budget/history
    // All months where budget has been explicitly configured — for history list
    @GetMapping("/history")
    fun getBudgetHistory(
        session: HttpSession?,
    ): ResponseEntity<List<BudgetHistoryResponse>> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(budgetService.getBudgetHistory(user.userId))
    }

    // PUT /api/budget
    // Upsert — creates if month has no budget, updates if it does
    // Returns full budget response with live summary immediately
    @PutMapping
    fun upsertBudget(
        session: HttpSession?,
        @Valid @RequestBody request: BudgetUpsertRequest,
    ): ResponseEntity<BudgetResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(budgetService.upsertBudget(user.userId, request))
    }

    // DELETE /api/budget?year=2025&month=6
    // Removes explicit budget config — GET will fall back to defaults
    @DeleteMapping
    fun deleteBudget(
        session: HttpSession?,
        @RequestParam year: Int,
        @RequestParam month: Int,
    ): ResponseEntity<Unit> {
        val user = SecurityUtils.resolveCurrentUser(session)
        budgetService.deleteBudget(user.userId, year, month)
        return ResponseEntity.noContent().build()
    }
}