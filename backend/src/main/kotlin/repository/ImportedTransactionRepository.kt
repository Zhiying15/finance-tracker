package com.finance.repository

import com.finance.entity.ImportedTransaction
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ImportedTransactionRepository : JpaRepository<ImportedTransaction, String> {
    fun findAllByBatchId(batchId: String): List<ImportedTransaction>
    fun findByIdAndBatchId(id: String, batchId: String): ImportedTransaction?
}