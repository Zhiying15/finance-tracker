package com.finance.repository

import com.finance.entity.ImportTransaction
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ImportTransactionRepository : JpaRepository<ImportTransaction, String> {
    fun findAllByBatchId(batchId: String): List<ImportTransaction>
    fun findByIdAndBatchId(id: String, batchId: String): ImportTransaction?
}