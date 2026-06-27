package com.finance.entity

import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint
import java.math.BigDecimal
import java.util.UUID

@Entity
@Table(
    name = "budgets",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["user_id", "year", "month"])
    ]
)
class Budget(

    @Id
    var id: String = UUID.randomUUID().toString(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    var user: User,

    var year: Int,
    var month: Int,

    var needPercent: BigDecimal,
    var wantPercent: BigDecimal,
    var savingsPercent: BigDecimal

) : BaseEntity()