package com.finance.importing.dto

data class BulkActionResult(
    val approved: Int,
    val skipped: Int,
    val message: String,
)
