package com.finance.service.impl

import com.finance.clients.AiClientProxy
import com.finance.service.AiParserService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

class AiParserServiceImpl : AiParserService{

    companion object {
        // Replaces Lombok's @Slf4j log instance
        private val log = LoggerFactory.getLogger(AiParserServiceImpl::class.java)
    }

    @Autowired
    private lateinit var aiClient : AiClientProxy

    override fun parse(text: String): List<String> {

        val prompt = """
            Extract transactions from this bank statement.

            Return JSON array:
            [
              {
                "date": "...",
                "amount": ...,
                "merchant": "...",
                "type": "...",
                "currency": "SGD"
              }
            ]

            TEXT:
            $text
        """.trimIndent()

        val response = aiClient.chat(prompt)

        return response
    }
}