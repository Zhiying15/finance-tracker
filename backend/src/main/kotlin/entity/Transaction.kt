package com.finance.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.math.BigDecimal
import java.time.LocalDate

@Entity
@Table(name = "transactions")
data class Transaction(

    @ManyToOne
    @JoinColumn(name = "user_id")
    var user: User,

    @ManyToOne
    @JoinColumn(name = "from_account_id")
    var fromAccount: Account?,

    @ManyToOne
    @JoinColumn(name = "to_account_id")
    var toAccount: Account?,

    @ManyToOne
    @JoinColumn(name = "transaction_type_id")
    var type: TransactionType,

    @ManyToOne
    @JoinColumn(name = "category_id")
    var category: Category?,

    @ManyToOne
    @JoinColumn(name = "merchant_id")
    var merchant: Merchant?,

    @Column(name = "transaction_date")
    var date: LocalDate,

    var description: String?,

    var amount: BigDecimal,

    @Column(name = "currency_code")
    var currency: String,

    var status: String = "DRAFT",

    var isManual: Boolean = false,

    var isRecurring: Boolean = false

) : BaseEntity()