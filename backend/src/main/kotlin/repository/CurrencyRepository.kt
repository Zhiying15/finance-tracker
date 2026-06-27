package com.finance.repository

import com.finance.entity.Currency
import org.springframework.data.jpa.repository.JpaRepository

interface CurrencyRepository : JpaRepository<Currency, Long> {
}