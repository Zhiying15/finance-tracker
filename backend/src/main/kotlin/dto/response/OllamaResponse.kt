package com.finance.dto.response

data class OllamaResponse(
    val model: String,
    val response: String,
    val done: Boolean
)