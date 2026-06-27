package com.finance.repository

import com.finance.entity.Transaction
import org.springframework.data.jpa.repository.JpaRepository

interface TransactionRepository : JpaRepository<Transaction, Long> {
    fun findByUserId(userId: String) : List<Transaction>
    fun findById(id: String) : Transaction?
}