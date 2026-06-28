package com.finance.dto.response

import com.finance.entity.Account
import java.math.BigDecimal
import java.time.LocalDate

data class AccountResponse(
    val id: String,
    val accountTypeId: Int,
    val accountTypeName: String,
    val assetClass: String,
    val name: String,
    val institution: String?,
    val currencyCode: String,
    val currentBalance: BigDecimal,
    val includeInNetWorth: Boolean,
    val isActive: Boolean,
    val lastValuationDate: LocalDate?,
) {
    companion object {
        fun from(entity: Account) = AccountResponse(
            id = entity.id,
            accountTypeId = entity.accountType.id,
            accountTypeName = entity.accountType.name,
            assetClass = entity.accountType.assetClass.name,
            name = entity.name,
            institution = entity.institution,
            currencyCode = entity.currency.code,
            currentBalance = entity.currentBalance,
            includeInNetWorth = entity.includeInNetWorth,
            isActive = entity.isActive,
            lastValuationDate = entity.lastValuationDate,
        )
    }
}