package importing.service.impl

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import importing.dto.OllamaParseResult
import importing.dto.ParsedTransactionFields
import importing.service.OllamaParserService
import org.slf4j.LoggerFactory
import org.springframework.ai.chat.messages.SystemMessage
import org.springframework.ai.chat.messages.UserMessage
import org.springframework.ai.chat.model.ChatModel
import org.springframework.ai.chat.prompt.Prompt
import org.springframework.stereotype.Service

@Service
class OllamaParserServiceImpl(
    private val chatModel: ChatModel,
    private val objectMapper: ObjectMapper,
): OllamaParserService {
    private val log = LoggerFactory.getLogger(javaClass)

    private val systemMessage = SystemMessage(
        """
        /no_think
        You are a financial data extraction engine.
        Extract transaction data from raw bank statement text.
        
        Return ONLY a single valid JSON object — no markdown, no explanation, no code fences.
        
        Required JSON schema:
        {
          "transactionDate": "YYYY-MM-DD or null",
          "description":     "string or null",
          "amount":          positive number or null,
          "isInflow":        true if credit/money received, false if debit/money spent, null if unclear,
          "currency":        "3-letter ISO code or null"
        }
        
        Rules:
        - amount is ALWAYS positive regardless of debit or credit
        - isInflow = true means money was received into the account
        - isInflow = false means money left the account
        - If a field cannot be found, use null
        - Return nothing except the JSON object
        """.trimIndent()
    )

    override fun parseRow(rawRow: String): OllamaParseResult {
        if (rawRow.isBlank()) {
            return OllamaParseResult(null, "Empty row skipped")
        }

        return try {
            val prompt = Prompt(
                listOf(
                    systemMessage,
                    UserMessage("Extract transaction from this bank statement row:\n$rawRow"),
                ),
//                OllamaChatOptions.builder()
//                    .temperature(0.0)
//                    .enableThinking()
//                    .numPredict(512)
//                    .build(),
            )

            val response    = chatModel.call(prompt)
            val rawContent  = response.result?.output?.text

            if (rawContent.isNullOrBlank()) {
                return OllamaParseResult(null, "Ollama returned empty response")
            }

            // Strip any accidental markdown fences
            val cleanedJson = rawContent
                .trim()
                .removePrefix("```json")
                .removePrefix("```")
                .removeSuffix("```")
                .trim()

            val parsed: ParsedTransactionFields = objectMapper.readValue(cleanedJson)

            OllamaParseResult(parsed = parsed, parseError = null)

        } catch (ex: Exception) {
            val errorMsg = "Parse failed: ${ex.message?.take(400)}"
            log.warn("Ollama parse error for row [$rawRow]: ${ex.message}")
            OllamaParseResult(null, errorMsg)
        }
    }
}