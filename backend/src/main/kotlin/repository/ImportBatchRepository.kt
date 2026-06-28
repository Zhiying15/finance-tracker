package com.finance.repository

import com.finance.entity.ImportBatch
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ImportBatchRepository : JpaRepository<ImportBatch, String> {
    fun findAllByUserIdOrderByUploadedAtDesc(userId: String): List<ImportBatch>
}