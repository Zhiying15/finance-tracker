package com.finance.transaction.repository

import com.finance.common.constants.BudgetType
import com.finance.entity.Currency
import com.finance.entity.Transaction
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.time.LocalDate

@Repository
interface TransactionRepository : JpaRepository<Transaction, String> {

    // -----------------------------------------------
    // Queries
    // -----------------------------------------------

    // All transactions for a user — paginated at service layer via Pageable if needed later
    fun findAllByUserIdOrderByTransactionDateDescCreatedAtDesc(
        userId: String,
    ): List<Transaction>

    // Scoped to a date range — used by monthly summary
    fun findAllByUserIdAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(
        userId: String,
        from: LocalDate,
        to: LocalDate,
    ): List<Transaction>

    // Single transaction scoped to user — primary BOLA guard
    fun findByIdAndUserId(id: String, userId: String): Transaction?

    // All transactions for a specific account (from or to)
    @Query("""
        SELECT t FROM Transaction t
        WHERE t.user.id = :userId
          AND (t.fromAccount.id = :accountId OR t.toAccount.id = :accountId)
        ORDER BY t.transactionDate DESC, t.createdAt DESC
    """)
    fun findAllByUserIdAndAccountId(
        @Param("userId") userId: String,
        @Param("accountId") accountId: String,
    ): List<Transaction>

    // -----------------------------------------------
    // Duplicate detection (import flow)
    // -----------------------------------------------

    // Check by reference number first (Option C from earlier decisions)
    @Query("""
        SELECT COUNT(t) > 0 FROM Transaction t
        WHERE t.user.id = :userId
          AND t.importedTransaction.id IS NOT NULL
          AND t.transactionDate = :date
          AND t.amount = :amount
          AND t.description = :description
    """)
    fun existsPossibleDuplicate(
        @Param("userId") userId: String,
        @Param("date") date: LocalDate,
        @Param("amount") amount: BigDecimal,
        @Param("description") description: String,
    ): Boolean

    // -----------------------------------------------
    // Budget summary calculations
    // -----------------------------------------------

    // Monthly total by budget type — drives actual spend in summary
    @Query("""
        SELECT COALESCE(SUM(t.amount * t.exchangeRate), 0)
        FROM Transaction t
        WHERE t.user.id    = :userId
          AND t.budgetType = :budgetType
          AND t.transactionDate >= :from
          AND t.transactionDate <= :to
    """)
    fun sumByBudgetTypeAndPeriod(
        @Param("userId") userId: String,
        @Param("budgetType") budgetType: BudgetType,
        @Param("from") from: LocalDate,
        @Param("to") to: LocalDate,
    ): BigDecimal

    // Rolling N-month average income — for forecasted income calculation
    // Native query: JPQL does not support AVG of a subquery SUM in FROM clause
    @Query(
        value = """
            SELECT COALESCE(AVG(monthly_total), 0)
            FROM (
                SELECT SUM(amount * exchange_rate) AS monthly_total
                FROM transactions
                WHERE user_id    = :userId
                  AND budget_type = 'INCOME'
                  AND transaction_date >= :fromDate
                GROUP BY YEAR(transaction_date), MONTH(transaction_date)
            ) AS monthly_income
        """,
        nativeQuery = true,
    )
    fun rollingAverageIncome(
        @Param("userId") userId: String,
        @Param("fromDate") fromDate: LocalDate,
    ): BigDecimal

    // -----------------------------------------------
    // Balance reconciliation (nightly scheduler)
    // -----------------------------------------------

    // Sum of all amounts flowing INTO an account (INFLOW + TRANSFER destination)
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.toAccount.id = :accountId
    """)
    fun sumInflowForAccount(@Param("accountId") accountId: String): BigDecimal

    // Sum of all amounts flowing OUT of an account (OUTFLOW + TRANSFER source)
    @Query("""
        SELECT COALESCE(SUM(t.amount), 0)
        FROM Transaction t
        WHERE t.fromAccount.id = :accountId
    """)
    fun sumOutflowForAccount(@Param("accountId") accountId: String): BigDecimal

    // -----------------------------------------------
    // Currency lookup (avoids separate CurrencyRepository)
    // -----------------------------------------------

    @Query("SELECT c FROM Currency c WHERE c.code = :code")
    fun findCurrencyByCode(@Param("code") code: String): Currency?
}