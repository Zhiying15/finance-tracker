package com.financeexchangerate.dto.response

data class FrankfurterResponse(
    val base: String,
    val date: String,
    val rates: Map<String, Number>,
)
