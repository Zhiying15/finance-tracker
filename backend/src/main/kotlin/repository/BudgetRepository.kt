package com.finance.repository

import com.finance.entity.Budget
import org.springframework.data.jpa.repository.JpaRepository

interface BudgetRepository : JpaRepository<Budget, Long> {
}