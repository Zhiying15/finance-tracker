package com.finance.repository

import com.finance.entity.ImportBatch
import org.springframework.data.jpa.repository.JpaRepository

interface ImportBatchRepository : JpaRepository<ImportBatch, Long> {
}