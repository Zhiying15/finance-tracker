package com.finance.entity

import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Table(
    name = "exchange_rates",
    uniqueConstraints = [
        UniqueConstraint(
            name = "uq_rate_base_target_date",
            columnNames = ["base_currency", "target_currency", "rate_date"]
        )
    ]
)
class ExchangeRate(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_currency", nullable = false)
    val baseCurrency: Currency,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_currency", nullable = false)
    val targetCurrency: Currency,

    @Column(name = "rate", nullable = false, precision = 18, scale = 8)
    val rate: BigDecimal,

    @Column(name = "rate_date", nullable = false)
    val rateDate: LocalDate,
)