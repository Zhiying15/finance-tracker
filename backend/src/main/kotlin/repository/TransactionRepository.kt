package com.finance.repository

import com.finance.constants.BudgetType
import com.finance.constants.TransactionStatus
import com.finance.entity.Transaction
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.time.LocalDate

@Repository
interface TransactionRepository : JpaRepository<Transaction, String> {

    fun findAllByUserIdOrderByTransactionDateDesc(userId: String): List<Transaction>

    fun findByIdAndUserId(id: String, userId: String): Transaction?

    // --- Duplicate detection ---
    fun existsByUserIdAndReferenceNumberAndReferenceNumberIsNotNull(
        userId: String,
        referenceNumber: String,
    ): Boolean

    fun existsByUserIdAndAmountAndTransactionDateAndReferenceNumberIsNull(
        userId: String,
        amount: BigDecimal,
        transactionDate: LocalDate,
    ): Boolean

    // --- Monthly income sum (INCOME budget_type only, excludes TRANSFER) ---
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.status = com.financetracker.domain.transaction.entity.TransactionStatus.APPROVED
          AND t.budgetType = com.financetracker.domain.category.entity.BudgetType.INCOME
          AND YEAR(t.transactionDate) = :year
          AND MONTH(t.transactionDate) = :month
    """)
    fun sumMonthlyIncome(
        @Param("userId") userId: String,
        @Param("year") year: Int,
        @Param("month") month: Int,
    ): BigDecimal

    // --- Monthly spend grouped by budget type ---
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.user.id = :userId
          AND t.status = com.financetracker.domain.transaction.entity.TransactionStatus.APPROVED
          AND t.budgetType = :budgetType
          AND YEAR(t.transactionDate) = :year
          AND MONTH(t.transactionDate) = :month
    """)
    fun sumMonthlyByBudgetType(
        @Param("userId") userId: String,
        @Param("budgetType") budgetType: BudgetType,
        @Param("year") year: Int,
        @Param("month") month: Int,
    ): BigDecimal

    // --- 3-month rolling average income ---
    // Native query used because JPQL does not support subquery in FROM clause (MySQL-specific AVG of sums)
    @Query(
        value = """
            SELECT COALESCE(AVG(monthly_total), 0)
            FROM (
                SELECT SUM(amount) AS monthly_total
                FROM transactions
                WHERE user_id   = :userId
                  AND status    = 'APPROVED'
                  AND budget_type = 'INCOME'
                  AND transaction_date >= :fromDate
                GROUP BY YEAR(transaction_date), MONTH(transaction_date)
            ) AS monthly_data
        """,
        nativeQuery = true,
    )
    fun rollingAverageIncome(
        @Param("userId") userId: String,
        @Param("fromDate") fromDate: LocalDate,
    ): BigDecimal

    // --- Reconciliation: sum all approved inflows into an account ---
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.toAccount.id = :accountId
          AND t.status = com.financetracker.domain.transaction.entity.TransactionStatus.APPROVED
    """)
    fun sumApprovedInflowForAccount(@Param("accountId") accountId: String): BigDecimal

    // --- Reconciliation: sum all approved outflows from an account ---
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.fromAccount.id = :accountId
          AND t.status = com.financetracker.domain.transaction.entity.TransactionStatus.APPROVED
    """)
    fun sumApprovedOutflowForAccount(@Param("accountId") accountId: String): BigDecimal
}