package com.finance.dto.response

import com.finance.constants.BudgetType
import com.finance.constants.TransactionStatus
import com.finance.entity.Transaction
import java.math.BigDecimal
import java.time.LocalDate

data class TransactionResponse(
    val id: String,
    val fromAccountId: String?,
    val toAccountId: String?,
    val transactionTypeName: String?,
    val flow: String?,
    val budgetType: BudgetType?,
    val transactionDate: LocalDate,
    val description: String?,
    val amount: BigDecimal,
    val currencyCode: String,
    val exchangeRate: BigDecimal,
    val isManual: Boolean,
) {
    companion object {
        fun from(entity: Transaction) = TransactionResponse(
            id = entity.id,
            fromAccountId = entity.fromAccount?.id,
            toAccountId = entity.toAccount?.id,
            transactionTypeName = entity.transactionType?.name,
            flow = entity.transactionType?.name,
            budgetType = entity.budgetType,
            transactionDate = entity.transactionDate,
            description = entity.description,
            amount = entity.amount,
            currencyCode = entity.currency.code,
            exchangeRate = entity.exchangeRate,
            isManual = entity.isManual,
        )
    }
}
