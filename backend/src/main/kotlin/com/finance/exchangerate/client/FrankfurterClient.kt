package com.finance.exchangerate.client

import com.finance.exchangerate.dto.response.FrankfurterResponse
import org.springframework.cloud.openfeign.FeignClient
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestParam

@FeignClient(
    name  = "frankfurter",
    url   = "\${app.exchange-rate.frankfurter-url:https://api.frankfurter.app}",
)
interface FrankfurterClient {

    @GetMapping("/latest")
    fun getLatestRates(
        @RequestParam("from") baseCurrency: String,
    ): FrankfurterResponse
}