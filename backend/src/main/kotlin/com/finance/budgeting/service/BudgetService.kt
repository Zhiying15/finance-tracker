package com.financebudgeting.service

import budgeting.dto.request.BudgetUpsertRequest
import budgeting.dto.response.BudgetHistoryResponse
import budgeting.dto.response.BudgetResponse

interface BudgetService {
    fun upsertBudget(userId: String, request: BudgetUpsertRequest): BudgetResponse
    fun getBudget(userId: String, year: Int, month: Int): BudgetResponse
    fun getBudgetHistory(userId: String): List<BudgetHistoryResponse>
    fun deleteBudget(userId: String, year: Int, month: Int)
}