package com.finance.service

import com.finance.dto.request.BudgetRequest
import com.finance.dto.response.MonthlySummaryResponse
import com.finance.entity.Budget

interface BudgetService {
    fun upsertBudget(userId: String, request: BudgetRequest): Budget
    fun getMonthlySummary(userId: String, year: Int, month: Int): MonthlySummaryResponse
}