package com.finance.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "accounts")
data class Account(

    @ManyToOne
    @JoinColumn(name = "user_id")
    var user: User,

    @ManyToOne
    @JoinColumn(name = "account_type_id")
    var accountType: AccountType,

    var name: String,

    var institution: String? = null,

    @Column(name = "currency_code")
    var currency: String

) : BaseEntity()