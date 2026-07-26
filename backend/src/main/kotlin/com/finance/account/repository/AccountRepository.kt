package com.finance.account.repository

import com.finance.common.constants.AccountCategory
import com.finance.entity.Account
import com.finance.entity.Currency
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.math.BigDecimal

@Repository
interface AccountRepository : JpaRepository<Account, String> {

    // All active accounts for a user — ordered for consistent UI display
    fun findAllByUserIdAndIsActiveTrueOrderByNameAsc(userId: String): List<Account>

    // All accounts including inactive — for admin/history view
    fun findAllByUserIdOrderByIsActiveDescNameAsc(userId: String): List<Account>

    // Single account scoped to user — primary BOLA guard
    fun findByIdAndUserId(id: String, userId: String): Account?

    // Fetch managed Currency proxy — used when creating accounts
    // Avoids a separate CurrencyRepository dependency in AccountService
    @Query("SELECT c FROM Currency c WHERE c.code = :code")
    fun findCurrencyByCode(@Param("code") code: String): Currency?

    // Net worth calculation — assets only
    @Query("""
    SELECT COALESCE(SUM(a.currentBalance), 0)
    FROM Account a
    WHERE a.user.id = :userId
      AND a.includeInNetWorth = true
      AND a.accountType.category = :category
      AND a.isActive = true
""")
    fun sumAssetBalance(
        @Param("userId") userId: String,
        @Param("category") category: AccountCategory = AccountCategory.ASSET
    ): BigDecimal

    // Net worth calculation — liabilities only
    @Query("""
        SELECT COALESCE(SUM(a.currentBalance), 0)
        FROM Account a
        WHERE a.user.id = :userId
          AND a.includeInNetWorth = true
          AND a.accountType.category = :category
          AND a.isActive = true
    """)
    fun sumLiabilityBalance
                (@Param("userId") userId: String,
                 @Param("category") category: AccountCategory = AccountCategory.LIABILITY
    ): BigDecimal

    // Existence check — prevents duplicate account names per user
    fun existsByUserIdAndNameIgnoreCaseAndIsActiveTrue(
        userId: String,
        name: String,
    ): Boolean

    // Existence check for update — excludes current account from name collision check
    fun existsByUserIdAndNameIgnoreCaseAndIsActiveTrueAndIdNot(
        userId: String,
        name: String,
        id: String,
    ): Boolean
}