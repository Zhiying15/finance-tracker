package com.finance.service

import com.finance.entity.Transaction

interface TransactionsService {
    fun create(tx: Transaction): Transaction
    fun getAll(userId: String): List<Transaction>
    fun approve(id: String)
}