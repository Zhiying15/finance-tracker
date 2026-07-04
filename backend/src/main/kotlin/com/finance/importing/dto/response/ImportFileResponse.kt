package com.finance.importing.dto.response

import java.time.LocalDateTime

data class ImportFileResponse(
    val id: String,
    val filename: String?,
    val status: String,
    val accountId: String,
    val accountName: String,
    val totalRows: Int,
    val pendingRows: Int,
    val approvedRows: Int,
    val rejectedRows: Int,
    val duplicateRows: Int,
    val parseErrorRows: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
)
