package com.finance.dto.request

data class OllamaRequest(
    val model: String,
    val prompt: String,
    val stream: Boolean = false
)