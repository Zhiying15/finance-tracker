package com.finance.service

import com.finance.dto.request.TransactionRequest
import com.finance.dto.response.BaseResponse
import com.finance.entity.Transaction
import org.springframework.stereotype.Service

@Service
interface TransactionsService {
    fun insert(txnRequest: TransactionRequest): BaseResponse
    fun updateTxnDetails(txnRequest: TransactionRequest): BaseResponse
    fun delete(txnIdentifier: String): BaseResponse
    fun listTransaction(userId: String): List<Transaction>
    fun approve(id: String)
}