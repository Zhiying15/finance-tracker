package com.finance.clients

import org.springframework.ai.chat.prompt.Prompt
import org.springframework.ai.ollama.OllamaChatModel
import org.springframework.http.MediaType
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux

@RestController
class OllamaStreamClient(
    private val chatModel: OllamaChatModel // Autowired by Spring Boot Starter
) {

    /**
     * Streams text tokens back to the client as Server-Sent Events (SSE).
     * The production media type ensures browsers or frontends process chunks sequentially.
     */
    @GetMapping("/api/ai/stream", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun streamAiResponse(@RequestParam prompt: String): Flux<String> {

        // Wrap your plain string prompt into Spring AI's Prompt context object
        val aiPrompt = Prompt(prompt)

        // .stream() asynchronously yields a Flux stream of structural AI pieces
        return chatModel.stream(aiPrompt)
            .map { chatResponse ->
                // Safely extract the generated textual piece (word fragment) from the stream packet
                chatResponse.result?.output?.content ?: ""
            }
            .filter { token -> token.isNotEmpty() } // Filter out any empty boundary packets
    }
}
