package com.finance.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "accounts")
class Account(

    @Id
    var id: String = UUID.randomUUID().toString(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    var user: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_type_id")
    var accountType: AccountType,

    var name: String,

    var institution: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_code")
    var currency: Currency? = null,

    @Column(nullable = false)
    var currentBalance: BigDecimal = 0.toBigDecimal(),

    var manualValuation: Boolean = false,

    var lastValuationDate: LocalDateTime = LocalDateTime.now(),

    var includeInNetWorth: Boolean = true,

    var notes: String,

    var isActive: Boolean = true

) : BaseEntity()