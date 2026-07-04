package exchangerate.controller

import common.utility.SecurityUtils
import exchangerate.dto.response.ExchangeRateResponse
import exchangerate.service.impl.ExchangeRateServiceImpl
import jakarta.servlet.http.HttpSession
import org.springframework.http.ResponseEntity
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
        session: HttpSession?,
    ): ResponseEntity<List<ExchangeRateResponse>> {
        SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(exchangeRateService.getLatestRates())
    }

    // GET /api/exchange-rates/{targetCurrency}
    // Latest rate for a specific currency pair
    // e.g. GET /api/exchange-rates/USD → SGD to USD rate
    @GetMapping("/{targetCurrency}")
    fun getRate(
        session: HttpSession?,
        @PathVariable targetCurrency: String,
    ): ResponseEntity<ExchangeRateResponse> {
        SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(
            exchangeRateService.getRate(targetCurrency.uppercase())
        )
    }

    // POST /api/exchange-rates/refresh
    // Manual trigger — useful for dev/testing without waiting for midnight
    @PostMapping("/refresh")
    fun refreshRates(
        session: HttpSession?,
    ): ResponseEntity<Map<String, String>> {
        SecurityUtils.resolveCurrentUser(session)
        exchangeRateService.fetchAndStoreRates()
        return ResponseEntity.ok(mapOf("message" to "Exchange rates refreshed successfully"))
    }
}