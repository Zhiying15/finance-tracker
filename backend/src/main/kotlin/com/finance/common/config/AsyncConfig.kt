package com.finance.common.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor
import java.util.concurrent.Executor

@Configuration
@EnableAsync
class AsyncConfig {

    @Bean(name = ["ollamaTaskExecutor"])
    fun ollamaTaskExecutor(): Executor =
        ThreadPoolTaskExecutor().apply {
            // One thread per concurrent import — Ollama is single-threaded locally
            // Increase corePoolSize if running multiple users concurrently
            corePoolSize    = 1
            maxPoolSize     = 2
            queueCapacity   = 10
            setThreadNamePrefix("ollama-import-")
            initialize()
        }
}