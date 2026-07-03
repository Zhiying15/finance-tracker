package com.finance.repository

import com.finance.entity.ImportedFile
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface ImportedFileRepository : JpaRepository<ImportedFile, String> {
    fun findAllByUserIdOrderByUploadedAtDesc(userId: String): List<ImportedFile>
}