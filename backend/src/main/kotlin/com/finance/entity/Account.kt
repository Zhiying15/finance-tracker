package com.financeentity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

@Entity
@Table(name = "accounts")
class Account(

    @Id
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    val id: String = UUID.randomUUID().toString(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    val user: User,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_type_id", nullable = false)
    val accountType: AccountType,

    @Column(name = "name", nullable = false, length = 100)
    var name: String,

    @Column(name = "institution", length = 100)
    var institution: String? = null,

    @Column(name = "account_number", length = 100)
    var accountNumber: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "currency_code", nullable = false)
    val currency: Currency,

    @Column(name = "current_balance", nullable = false, precision = 18, scale = 2)
    var currentBalance: BigDecimal = BigDecimal.ZERO,

    @Column(name = "manual_valuation")
    val manualValuation: Boolean = false,

    @Column(name = "last_valuation_date")
    var lastValuationDate: LocalDate? = null,

    @Column(name = "include_in_net_worth")
    var includeInNetWorth: Boolean = true,

    @Column(name = "notes", columnDefinition = "TEXT")
    var notes: String? = null,

    @Column(name = "is_active")
    var isActive: Boolean = true

) : BaseEntity()