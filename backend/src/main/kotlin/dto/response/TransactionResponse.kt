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
    val categoryId: Int?,
    val categoryName: String?,
    val budgetType: BudgetType?,
    val merchantId: Int?,
    val merchantName: String?,
    val transactionDate: LocalDate,
    val description: String?,
    val referenceNumber: String?,
    val amount: BigDecimal,
    val currencyCode: String,
    val exchangeRate: BigDecimal,
    val status: TransactionStatus,
    val isManual: Boolean,
) {
    companion object {
        fun from(entity: Transaction) = TransactionResponse(
            id = entity.id,
            fromAccountId = entity.fromAccount?.id,
            toAccountId = entity.toAccount?.id,
            transactionTypeName = entity.transactionType?.name,
            flow = entity.transactionType?.flow?.name,
            categoryId = entity.category?.id,
            categoryName = entity.category?.name,
            budgetType = entity.budgetType,
            merchantId = entity.merchant?.id,
            merchantName = entity.merchant?.merchantName,
            transactionDate = entity.transactionDate,
            description = entity.description,
            referenceNumber = entity.referenceNumber,
            amount = entity.amount,
            currencyCode = entity.currency.code,
            exchangeRate = entity.exchangeRate,
            status = entity.status,
            isManual = entity.isManual,
        )
    }
}
