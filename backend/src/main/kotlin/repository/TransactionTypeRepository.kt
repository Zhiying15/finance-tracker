package com.finance.repository

import com.finance.entity.TransactionType
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface TransactionTypeRepository : JpaRepository<TransactionType, Long> {
    fun findById(transactionTypeId: Int): Optional<TransactionType>
}