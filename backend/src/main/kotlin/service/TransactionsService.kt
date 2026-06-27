package com.finance.service

import com.finance.entity.Transaction
import org.springframework.stereotype.Service

@Service
interface TransactionsService {
    fun create(tx: Transaction): Transaction
    fun getAll(userId: String): List<Transaction>
    fun approve(id: String)
}