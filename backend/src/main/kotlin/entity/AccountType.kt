package com.finance.entity

import jakarta.persistence.Entity
import jakarta.persistence.Table

@Entity
@Table(name = "account_types")
data class AccountType(
    var name: String
) : BaseEntity()


@Entity
@Table(name = "transaction_types")
data class TransactionType(
    var name: String,
    var flow: String
) : BaseEntity()