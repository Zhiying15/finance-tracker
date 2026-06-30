package com.finance.entity

import jakarta.persistence.Column
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
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    val id: String = UUID.randomUUID().toString(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    val user: User,

    @Column(name = "year", nullable = false)
    val year: Int,

    @Column(name = "month", nullable = false)
    val month: Int,

    @Column(name = "need_percent", precision = 5, scale = 2)
    var needPercent: BigDecimal? = null,

    @Column(name = "want_percent", precision = 5, scale = 2)
    var wantPercent: BigDecimal? = null,

    @Column(name = "savings_percent", precision = 5, scale = 2)
    var savingsPercent: BigDecimal? = null,

    @Column(name = "declared_income", precision = 18, scale = 2)
    var declaredIncome: BigDecimal? = null,

) : BaseEntity()