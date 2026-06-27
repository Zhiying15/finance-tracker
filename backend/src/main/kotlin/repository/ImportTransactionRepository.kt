package com.finance.repository

import com.finance.entity.ImportTransaction
import org.springframework.data.jpa.repository.JpaRepository

interface ImportTransactionRepository : JpaRepository<ImportTransaction, Long> {
}