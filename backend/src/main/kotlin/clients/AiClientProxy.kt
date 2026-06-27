package com.finance.clients


import com.finance.dto.request.AiClientRequest
import com.finance.dto.response.AiClientResponse
import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody

@FeignClient(
    name = "AiClient",
    url = "http://localhost:11434" // Replace with your target API base URL
)
interface AiClientProxy {

    // Performs a POST request passing a JSON body
    @PostMapping("/api/chat")
    fun chat(@RequestBody request: AiClientRequest): AiClientResponse
}
