package com.finance.repository

import com.finance.entity.RecurringTransaction
import org.springframework.data.jpa.repository.JpaRepository

interface RecurringTransactionRepository : JpaRepository<RecurringTransaction, Long> {
}