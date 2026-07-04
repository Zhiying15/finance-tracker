package com.financeimporting.dto

data class OllamaParseResult(
    val parsed: ParsedTransactionFields?,
    val parseError: String?,
)
