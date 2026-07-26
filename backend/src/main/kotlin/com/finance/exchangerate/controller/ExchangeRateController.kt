package com.finance.exchangerate.controller

import com.finance.exchangerate.dto.response.ExchangeRateResponse
import com.finance.exchangerate.service.impl.ExchangeRateServiceImpl
import com.finance.user.security.UserPrincipal
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*


@RestController
@RequestMapping("/exchange-rates")
class ExchangeRateController(
    private val exchangeRateService: ExchangeRateServiceImpl,
) {
    // GET /api/exchange-rates
    // Latest rates for all currencies relative to base (SGD)
    @GetMapping
    fun getLatestRates(
        @AuthenticationPrincipal user: UserPrincipal,
    ): ResponseEntity<List<ExchangeRateResponse>> {
        return ResponseEntity.ok(exchangeRateService.getLatestRates())
    }

    // GET /api/exchange-rates/{targetCurrency}
    // Latest rate for a specific currency pair
    // e.g. GET /api/exchange-rates/USD → SGD to USD rate
    @GetMapping("/{targetCurrency}")
    fun getRate(
        @AuthenticationPrincipal user: UserPrincipal,
        @PathVariable targetCurrency: String,
    ): ResponseEntity<ExchangeRateResponse> {
        return ResponseEntity.ok(
            exchangeRateService.getRate(targetCurrency.uppercase())
        )
    }

    // POST /api/exchange-rates/refresh
    // Manual trigger — useful for dev/testing without waiting for midnight
    @PostMapping("/refresh")
    fun refreshRates(
        @AuthenticationPrincipal user: UserPrincipal,
    ): ResponseEntity<Map<String, String>> {
        exchangeRateService.fetchAndStoreRates()
        return ResponseEntity.ok(mapOf("message" to "Exchange rates refreshed successfully"))
    }
}