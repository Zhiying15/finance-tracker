package com.finance.datadictionary.repository

import com.finance.entity.DataDictionary
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DataDictionaryRepository : JpaRepository<DataDictionary, Int> {

    // Single group — used by individual dropdown endpoints
    fun findAllByGroupNameAndIsActiveTrueOrderByDisplayOrderAsc(
        groupName: String,
    ): List<DataDictionary>

    // All active entries — used for prefetch-all on app init
    fun findAllByIsActiveTrueOrderByGroupNameAscDisplayOrderAsc(): List<DataDictionary>

    // Idempotency check in seeder
    fun existsByGroupNameAndCode(groupName: String, code: String): Boolean
}