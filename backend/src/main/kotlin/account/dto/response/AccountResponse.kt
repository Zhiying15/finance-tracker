package account.dto.response

import entity.Account
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class AccountResponse(
    val id: String,
    val accountType: AccountTypeResponse,
    val name: String,
    val institution: String?,
    val accountNumber: String?,
    val currencyCode: String,
    val currencySymbol: String?,
    val currentBalance: BigDecimal,
    val manualValuation: Boolean,
    val lastValuationDate: LocalDate?,
    val includeInNetWorth: Boolean,
    val notes: String?,
    val isActive: Boolean,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {
    companion object {
        fun from(entity: Account) = AccountResponse(
            id = entity.id,
            accountType = AccountTypeResponse.from(entity.accountType),
            name = entity.name,
            institution = entity.institution,
            accountNumber = entity.accountNumber,
            currencyCode = entity.currency.code,
            currencySymbol = entity.currency.symbol,
            currentBalance = entity.currentBalance,
            manualValuation = entity.manualValuation,
            lastValuationDate = entity.lastValuationDate,
            includeInNetWorth = entity.includeInNetWorth,
            notes = entity.notes,
            isActive = entity.isActive,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
        )
    }
}