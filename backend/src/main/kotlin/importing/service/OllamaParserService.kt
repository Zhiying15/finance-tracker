package importing.service

import importing.dto.OllamaParseResult
import org.springframework.stereotype.Service

@Service
interface OllamaParserService {
    fun parseRow(rawRow: String): OllamaParseResult
}