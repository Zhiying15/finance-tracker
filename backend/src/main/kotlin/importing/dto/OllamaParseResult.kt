package importing.dto

data class OllamaParseResult(
    val parsed: ParsedTransactionFields?,
    val parseError: String?,
)
