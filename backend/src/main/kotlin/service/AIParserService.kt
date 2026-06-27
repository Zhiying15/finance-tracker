package com.finance.service

import org.springframework.stereotype.Service

@Service
interface AIParserService {
    fun parse(text: String): List<String>
}