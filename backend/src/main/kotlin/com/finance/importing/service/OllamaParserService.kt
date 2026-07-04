package com.finance.importing.service

import com.finance.importing.dto.OllamaParseResult
import org.springframework.stereotype.Service

@Service
interface OllamaParserService {
    fun parseRow(rawRow: String): OllamaParseResult
}