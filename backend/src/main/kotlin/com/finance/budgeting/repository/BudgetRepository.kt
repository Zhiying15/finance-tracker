package com.finance.budgeting.repository

import com.finance.entity.Budget
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface BudgetRepository : JpaRepository<Budget, String> {

    fun findByUserIdAndYearAndMonth(
        userId: String,
        year: Int,
        month: Int,
    ): Budget?

    fun findAllByUserIdOrderByYearDescMonthDesc(
        userId: String,
    ): List<Budget>

    @Query("""
        SELECT b FROM Budget b
        WHERE b.user.id = :userId
        ORDER BY b.year DESC, b.month DESC
    """)
    fun findRecentByUserId(
        @Param("userId") userId: String,
        pageable: Pageable,
    ): List<Budget>
}