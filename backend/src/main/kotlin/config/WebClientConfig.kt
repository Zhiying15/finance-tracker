package com.finance.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@Configuration
class WebClientConfig {

    @Bean
    fun frankfurterWebClient(
        @Value("\${app.exchange-rate.frankfurter-url}") baseUrl: String,
    ): WebClient = WebClient.builder()
        .baseUrl(baseUrl)
        .defaultHeader("Accept", "application/json")
        .build()
}