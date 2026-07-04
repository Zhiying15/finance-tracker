package transaction.dto.response

import common.constants.BudgetType
import common.constants.TransactionFlow
import entity.Transaction
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.LocalDateTime

data class TransactionResponse(
    val id: String,
    val fromAccount: AccountSummary?,
    val toAccount: AccountSummary?,
    val transactionFlow: TransactionFlow?,
    val transactionDate: LocalDate,
    val description: String?,
    val amount: BigDecimal,
    val currencyCode: String,
    val currencySymbol: String?,
    val exchangeRate: BigDecimal,
    val amountInBaseCurrency: BigDecimal,
    val remarks: String?,
    val isManual: Boolean,
    val isRecurring: Boolean,
    val budgetType: BudgetType?,
    val importedTransactionId: String?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {
    // Lightweight account info — avoids circular AccountResponse dependency
    data class AccountSummary(
        val id: String,
        val name: String,
        val institution: String?,
        val currencyCode: String,
        val assetClass: String,
    )

    companion object {
        fun from(entity: Transaction) = TransactionResponse(
            id = entity.id,
            fromAccount = entity.fromAccount?.let {
                AccountSummary(
                    id = it.id,
                    name = it.name,
                    institution = it.institution,
                    currencyCode = it.currency.code,
                    assetClass = it.accountType.assetClass.name,
                )
            },
            toAccount = entity.toAccount?.let {
                AccountSummary(
                    id = it.id,
                    name = it.name,
                    institution = it.institution,
                    currencyCode = it.currency.code,
                    assetClass = it.accountType.assetClass.name,
                )
            },
            transactionFlow = entity.transactionFlow,
            transactionDate = entity.transactionDate,
            description = entity.description,
            amount = entity.amount,
            currencyCode = entity.currency.code,
            currencySymbol = entity.currency.symbol,
            exchangeRate = entity.exchangeRate,
            // Converts foreign currency amount to base (SGD) using stored exchange rate
            amountInBaseCurrency = entity.amount.multiply(entity.exchangeRate)
                .setScale(2, RoundingMode.HALF_UP),
            remarks = entity.remarks,
            isManual = entity.isManual,
            isRecurring = entity.isRecurring,
            budgetType = entity.budgetType,
            importedTransactionId = entity.importedTransaction?.id,
            createdAt = entity.createdAt,
            updatedAt = entity.updatedAt,
        )
    }
}
