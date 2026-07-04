package com.finance

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableScheduling
@EnableFeignClients
class FinanceTrackerApplication

fun main(args: Array<String>) {
    runApplication<FinanceTrackerApplication>(*args)
}
