package com.finance.repository

import com.finance.entity.Budget
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface BudgetRepository : JpaRepository<Budget, String> {
    fun findByUserIdAndYearAndMonth(userId: String, year: Int, month: Int): Budget?
}