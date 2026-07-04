package com.finance.exchangerate.dto.response

data class FrankfurterResponse(
    val base: String,
    val date: String,
    val rates: Map<String, Number>,
)
