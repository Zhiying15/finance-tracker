package com.financeexchangerate.dto.response

import entity.ExchangeRate
import java.math.BigDecimal
import java.time.LocalDate

data class ExchangeRateResponse(
    val id: Int,
    val baseCurrency: String,
    val targetCurrency: String,
    val rate: BigDecimal,
    val rateDate: LocalDate,
) {
    companion object {
        fun from(entity: ExchangeRate) = ExchangeRateResponse(
            id             = entity.id,
            baseCurrency   = entity.baseCurrency.code,
            targetCurrency = entity.targetCurrency.code,
            rate           = entity.rate,
            rateDate       = entity.rateDate,
        )
    }
}
