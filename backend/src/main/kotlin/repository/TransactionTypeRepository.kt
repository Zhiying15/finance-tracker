package com.finance.repository

import com.finance.entity.TransactionType
import org.springframework.data.jpa.repository.JpaRepository

interface TransactionTypeRepository : JpaRepository<TransactionType, Long> {
}