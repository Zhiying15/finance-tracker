package exchangerate.service.impl

import common.exception.AppException
import entity.Currency
import entity.ExchangeRate
import exchangerate.dto.response.ExchangeRateResponse
import exchangerate.repository.ExchangeRateRepository
import jakarta.persistence.EntityManager
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.core.annotation.Order
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.reactive.function.client.WebClient
import java.math.BigDecimal
import java.time.LocalDate

@Service
@Order(2) // Runs after DataDictionarySeeder at Order(1)
class ExchangeRateServiceImpl(
    @Qualifier("frankfurterWebClient") private val webClient: WebClient,
    private val exchangeRateRepository: ExchangeRateRepository,
    private val entityManager: EntityManager,
    @Value("\${app.exchange-rate.base-currency:SGD}") private val baseCurrency: String,
) : ApplicationRunner {

    private val log = LoggerFactory.getLogger(javaClass)

    // -----------------------------------------------
    // Startup seed — fetch immediately on boot
    // -----------------------------------------------

    override fun run(args: ApplicationArguments) {
        log.info("Startup exchange rate fetch...")
        runCatching { fetchAndStoreRates() }
            .onFailure {
                log.warn("Startup exchange rate fetch failed (non-fatal): ${it.message}")
            }
    }

    // -----------------------------------------------
    // Scheduled — midnight daily
    // -----------------------------------------------

    @Scheduled(cron = "\${app.exchange-rate.cron:0 0 0 * * *}")
    fun scheduledFetch() {
        log.info("Scheduled exchange rate fetch triggered")
        runCatching { fetchAndStoreRates() }
            .onFailure { log.error("Scheduled exchange rate fetch failed: ${it.message}", it) }
    }

    // -----------------------------------------------
    // Core fetch + store
    // -----------------------------------------------

    @Transactional
    fun fetchAndStoreRates() {
        val today = LocalDate.now()
        log.info("Fetching rates from Frankfurter — base=$baseCurrency date=$today")

        val response = webClient
            .get()
            .uri("/latest?from=$baseCurrency")
            .retrieve()
            .bodyToMono(FrankfurterResponse::class.java)
            .block()
            ?: run {
                log.error("Frankfurter returned null response")
                return
            }

        val baseCurrencyRef = currencyRef(baseCurrency)

        val ratesToSave = response.rates.mapNotNull { (targetCode, rate) ->
            // Skip if already stored for today — idempotent
            if (exchangeRateRepository
                    .existsByBaseCurrencyCodeAndTargetCurrencyCodeAndRateDate(
                        baseCurrency, targetCode, today
                    )
            ) return@mapNotNull null

            // Skip unknown currency codes not in our currencies table
            val targetCurrencyRef = runCatching {
                currencyRef(targetCode)
            }.getOrElse {
                log.warn("Skipping unknown currency code: $targetCode")
                return@mapNotNull null
            }

            ExchangeRate(
                baseCurrency = baseCurrencyRef,
                targetCurrency = targetCurrencyRef,
                rate = BigDecimal(rate.toString()),
                rateDate = today,
            )
        }

        if (ratesToSave.isNotEmpty()) {
            exchangeRateRepository.saveAll(ratesToSave)
            log.info("Stored ${ratesToSave.size} exchange rates for $today")
        } else {
            log.info("All rates already stored for $today — skipped")
        }
    }

    // -----------------------------------------------
    // Queries
    // -----------------------------------------------

    @Transactional(readOnly = true)
    fun getLatestRates(): List<ExchangeRateResponse> =
        exchangeRateRepository
            .findLatestRatesForBase(baseCurrency)
            .map { ExchangeRateResponse.from(it) }

    @Transactional(readOnly = true)
    fun getRate(targetCurrency: String): ExchangeRateResponse {
        val rate = exchangeRateRepository
            .findTopByBaseCurrencyCodeAndTargetCurrencyCodeOrderByRateDateDesc(
                baseCurrency, targetCurrency
            ) ?: throw AppException.NotFound(
            "No exchange rate found for $baseCurrency → $targetCurrency"
        )
        return ExchangeRateResponse.from(rate)
    }

    @Transactional(readOnly = true)
    fun getLatestRate(targetCurrency: String): BigDecimal? =
        exchangeRateRepository
            .findTopByBaseCurrencyCodeAndTargetCurrencyCodeOrderByRateDateDesc(
                baseCurrency, targetCurrency
            )?.rate

    // -----------------------------------------------
    // Internal
    // -----------------------------------------------

    // Returns a Hibernate proxy reference for the FK — does NOT issue a SELECT
    private fun currencyRef(code: String) =
        entityManager.getReference(
            Currency::class.java, code
        )

    private data class FrankfurterResponse(
        val base: String,
        val date: String,
        val rates: Map<String, Number>,
    )
}