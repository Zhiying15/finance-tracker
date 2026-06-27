package com.finance.service

interface AiParserService {
    fun parse(text: String): List<String>
}