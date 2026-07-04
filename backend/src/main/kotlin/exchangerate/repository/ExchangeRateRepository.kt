package exchangerate.repository

import entity.Currency
import entity.ExchangeRate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.time.LocalDate

@Repository
interface ExchangeRateRepository : JpaRepository<ExchangeRate, Int> {

    // Most recent rate for a currency pair — used by TransactionService
    fun findTopByBaseCurrencyCodeAndTargetCurrencyCodeOrderByRateDateDesc(
        baseCurrency: String,
        targetCurrency: String,
    ): ExchangeRate?

    // All rates for a given date — used to verify fetch completeness
    fun findAllByRateDate(rateDate: LocalDate): List<ExchangeRate>

    // Idempotency check — prevents duplicate rows on re-fetch
    fun existsByBaseCurrencyCodeAndTargetCurrencyCodeAndRateDate(
        baseCurrency: String,
        targetCurrency: String,
        rateDate: LocalDate,
    ): Boolean

    // Latest rates for all pairs — for display endpoint
    @Query("""
        SELECT e FROM ExchangeRate e
        WHERE e.baseCurrency.code = :baseCurrency
          AND e.rateDate = (
              SELECT MAX(e2.rateDate)
              FROM ExchangeRate e2
              WHERE e2.baseCurrency.code   = :baseCurrency
                AND e2.targetCurrency.code = e.targetCurrency.code
          )
        ORDER BY e.targetCurrency.code ASC
    """)
    fun findLatestRatesForBase(
        @Param("baseCurrency") baseCurrency: String,
    ): List<ExchangeRate>

    // Managed Currency proxy — avoids CurrencyRepository dependency
    @Query("SELECT c FROM Currency c WHERE c.code = :code")
    fun findCurrencyByCode(@Param("code") code: String): Currency?
}