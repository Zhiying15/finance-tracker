package com.finance.service

import com.finance.dto.request.TransactionRequest
import com.finance.dto.request.TransactionUpdateRequest
import com.finance.dto.response.BaseResponse
import com.finance.dto.response.TransactionResponse
import com.finance.entity.Transaction
import org.springframework.stereotype.Service

@Service
interface TransactionsService {
    fun listTransactions(userId: String): List<TransactionResponse>
    fun createManualTransaction(userId: String, request: TransactionRequest): TransactionResponse
    fun voidTransaction(userId: String, transactionId: String)
    fun updateTransaction(
        userId: String,
        transactionId: String,
        request: TransactionUpdateRequest,
    ): TransactionResponse
}