package com.financeimporting.dto

data class BulkActionResult(
    val approved: Int,
    val skipped: Int,
    val message: String,
)
