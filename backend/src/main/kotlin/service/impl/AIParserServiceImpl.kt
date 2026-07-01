package com.finance.service.impl

import com.fasterxml.jackson.databind.ObjectMapper
import com.finance.dto.OllamaParseResult
import com.finance.dto.ParsedTransaction
import org.slf4j.LoggerFactory
import org.springframework.ai.chat.messages.SystemMessage
import org.springframework.ai.chat.messages.UserMessage
import org.springframework.ai.chat.model.ChatModel
import org.springframework.ai.chat.prompt.Prompt
import org.springframework.ai.converter.BeanOutputConverter
import org.springframework.stereotype.Service

@Service
class OllamaParserService(
    // Spring AI auto-configures and injects OllamaChatModel via the starter
    private val chatModel: ChatModel,
    private val objectMapper: ObjectMapper,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    // BeanOutputConverter generates a strict JSON Schema from ParsedTransaction
    // and provides a convert() method to deserialize the model's response
    private val outputConverter = BeanOutputConverter(ParsedTransaction::class.java)

    private val systemPrompt = SystemMessage(
        """
        You are a financial data extraction engine.
        Extract transaction data from the provided raw CSV row text.
        Return ONLY a valid JSON object that strictly conforms to the provided schema.
        Do not include any explanation, markdown, code fences, or extra text.
        If a field cannot be found in the input, return null for that field.
        For transactionDate, use ISO format: YYYY-MM-DD.
        For amount, always return a positive number.
        For isInflow, return true if money was received (credit), false if money was spent (debit).
        For currency, return the 3-letter ISO code (e.g. SGD, USD).
        """.trimIndent()
    )

    fun parseRow(rawRow: String): OllamaParseResult {
        if (rawRow.isBlank()) {
            return OllamaParseResult(null, "Empty row")
        }

        return try {
            val userMessage = UserMessage(
                """
                Extract transaction data from this raw CSV row and return JSON matching the schema below.
                
                Schema:
                ${outputConverter.jsonSchema}
                
                Raw CSV row:
                $rawRow
                """.trimIndent()
            )

            val prompt = Prompt(
                listOf(systemPrompt, userMessage),
//                OllamaChatOptions.builder()
//                    .temperature(0.0)         // Deterministic output — critical for JSON extraction
//                    .enableThinking()         // Qwen3 thinking mode ON
//                    .numPredict(1024)
//                    .build()
            )

            val response = chatModel.call(prompt)
            val rawContent = response.result.output.text

            if (rawContent.isNullOrBlank()) {
                return OllamaParseResult(null, "Ollama returned empty response")
            }

            // Strip any accidental markdown fences despite instructions
            val cleanedJson = rawContent
                .trim()
                .removePrefix("```json")
                .removePrefix("```")
                .removeSuffix("```")
                .trim()

            // BeanOutputConverter handles deserialization with Jackson
            val parsed: ParsedTransaction = outputConverter.convert(cleanedJson)
                ?: return OllamaParseResult(null, "Failed to deserialize Ollama response")

            OllamaParseResult(parsed = parsed, parseError = null)

        } catch (ex: Exception) {
            val errorMessage = "Parse failed: ${ex.message?.take(400)}"
            log.warn("Ollama parsing failed for row [$rawRow]: ${ex.message}")
            OllamaParseResult(null, errorMessage)
        }
    }
}