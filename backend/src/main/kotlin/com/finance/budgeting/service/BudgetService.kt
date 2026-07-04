package com.finance.budgeting.service

import com.finance.budgeting.dto.request.BudgetUpsertRequest
import com.finance.budgeting.dto.response.BudgetHistoryResponse
import com.finance.budgeting.dto.response.BudgetResponse

interface BudgetService {
    fun upsertBudget(userId: String, request: BudgetUpsertRequest): BudgetResponse
    fun getBudget(userId: String, year: Int, month: Int): BudgetResponse
    fun getBudgetHistory(userId: String): List<BudgetHistoryResponse>
    fun deleteBudget(userId: String, year: Int, month: Int)
}