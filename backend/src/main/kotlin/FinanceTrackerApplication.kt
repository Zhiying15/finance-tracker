package com.finance

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients

@SpringBootApplication
@EnableFeignClients
class FinanceTrackerApplication

fun main(args: Array<String>) {
    runApplication<FinanceTrackerApplication>(*args)
}
