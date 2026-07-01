package com.finance.dto

import java.math.BigDecimal
import java.time.LocalDate
import com.fasterxml.jackson.annotation.JsonProperty

/**
 * Represents a single transaction extracted from a raw CSV row by Qwen3.
 * All fields are nullable — Qwen3 may not find every field in every row.
 * @JsonProperty(required = true) is used by BeanOutputConverter to mark
 * fields as required in the generated JSON schema sent to Ollama.
 */
data class ParsedTransaction(
    @JsonProperty(required = true, value = "transactionDate")
    val transactionDate: LocalDate?,

    @JsonProperty(required = true, value = "description")
    val description: String?,

    @JsonProperty(required = true, value = "amount")
    val amount: BigDecimal?,

    @JsonProperty(required = true, value = "isInflow")
    val isInflow: Boolean?,

    @JsonProperty(required = true, value = "referenceNumber")
    val referenceNumber: String?,

    @JsonProperty(required = true, value = "currency")
    val currency: String?,
)

data class OllamaParseResult(
    val parsed: ParsedTransaction?,
    val parseError: String?,
)