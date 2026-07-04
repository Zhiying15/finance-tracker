package com.finance.exchangerate.service.impl

import com.finance.common.exception.AppException
import com.finance.entity.Currency
import com.finance.entity.ExchangeRate
import com.finance.exchangerate.client.FrankfurterClient
import com.finance.exchangerate.dto.response.ExchangeRateResponse
import com.finance.exchangerate.dto.response.FrankfurterResponse
import com.finance.exchangerate.repository.ExchangeRateRepository
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
@Order(2)
class ExchangeRateServiceImpl(
    private val frankfurterClient: FrankfurterClient,
    private val exchangeRateRepository: ExchangeRateRepository,
    private val entityManager: EntityManager,
    @Value("\${app.exchange-rate.base-currency:SGD}") private val baseCurrency: String,
) : ApplicationRunner {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun run(args: ApplicationArguments) {
        log.info("Startup exchange rate fetch...")
        runCatching { fetchAndStoreRates() }
            .onFailure {
                log.warn("Startup exchange rate fetch failed (non-fatal): ${it.message}")
            }
    }

    @Scheduled(cron = "\${app.exchange-rate.cron:0 0 0 * * *}")
    fun scheduledFetch() {
        log.info("Scheduled exchange rate fetch triggered")
        runCatching { fetchAndStoreRates() }
            .onFailure { log.error("Scheduled fetch failed: ${it.message}", it) }
    }

    @Transactional
    fun fetchAndStoreRates() {
        val today = LocalDate.now()
        log.info("Fetching rates from Frankfurter — base=$baseCurrency date=$today")

        val response: FrankfurterResponse = runCatching {
            frankfurterClient.getLatestRates(baseCurrency)
        }.getOrElse {
            log.error("Frankfurter API call failed: ${it.message}")
            return
        }

        val baseCurrencyRef = currencyRef(baseCurrency)

        val ratesToSave = response.rates.mapNotNull { (targetCode, rate) ->
            if (exchangeRateRepository
                    .existsByBaseCurrencyCodeAndTargetCurrencyCodeAndRateDate(
                        baseCurrency, targetCode, today
                    )
            ) return@mapNotNull null

            runCatching {
                ExchangeRate(
                    baseCurrency = baseCurrencyRef,
                    targetCurrency = currencyRef(targetCode),
                    rate = BigDecimal(rate.toString()),
                    rateDate = today,
                )
            }.onFailure {
                log.warn("Skipping unknown currency: $targetCode — ${it.message}")
            }.getOrNull()
        }

        if (ratesToSave.isNotEmpty()) {
            exchangeRateRepository.saveAll(ratesToSave)
            log.info("Stored ${ratesToSave.size} rates for $today")
        } else {
            log.info("All rates already stored for $today — skipped")
        }
    }

    @Transactional(readOnly = true)
    fun getLatestRates(): List<ExchangeRateResponse> =
        exchangeRateRepository
            .findLatestRatesForBase(baseCurrency)
            .map { ExchangeRateResponse.from(it) }

    @Transactional(readOnly = true)
    fun getRate(targetCurrency: String): ExchangeRateResponse =
        exchangeRateRepository
            .findTopByBaseCurrencyCodeAndTargetCurrencyCodeOrderByRateDateDesc(
                baseCurrency, targetCurrency
            )?.let { ExchangeRateResponse.from(it) }
            ?: throw AppException.NotFound(
                "No exchange rate found for $baseCurrency → $targetCurrency"
            )

    @Transactional(readOnly = true)
    fun getLatestRate(targetCurrency: String): BigDecimal? =
        exchangeRateRepository
            .findTopByBaseCurrencyCodeAndTargetCurrencyCodeOrderByRateDateDesc(
                baseCurrency, targetCurrency
            )?.rate

    private fun currencyRef(code: String) =
        entityManager.getReference(Currency::class.java, code)
}