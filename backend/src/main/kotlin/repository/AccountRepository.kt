package com.finance.repository

import com.finance.entity.Account
import com.finance.entity.Currency
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import java.math.BigDecimal


@Repository
interface AccountRepository : JpaRepository<Account, String> {

    fun findAllByUserIdAndIsActiveTrue(userId: String): List<Account>

    fun findByIdAndUserId(id: String, userId: String): Account?

    // Fetch a managed CurrencyEntity by code for FK-safe association
    @Query("SELECT c FROM CurrencyEntity c WHERE c.code = :code")
    fun findCurrencyByCode(code: String): Currency?

    @Query("""
        SELECT COALESCE(SUM(a.currentBalance), 0)
        FROM AccountEntity a
        WHERE a.user.id = :userId
          AND a.includeInNetWorth = true
          AND a.accountType.category = com.financetracker.domain.account.entity.AccountCategory.ASSET
          AND a.isActive = true
    """)
    fun sumAssetBalanceByUserId(userId: String): BigDecimal

    @Query("""
        SELECT COALESCE(SUM(a.currentBalance), 0)
        FROM AccountEntity a
        WHERE a.user.id = :userId
          AND a.includeInNetWorth = true
          AND a.accountType.category = com.financetracker.domain.account.entity.AccountCategory.LIABILITY
          AND a.isActive = true
    """)
    fun sumLiabilityBalanceByUserId(userId: String): BigDecimal
}