package com.finance.entity

import com.finance.constants.TransactionFlow
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "transaction_types")
class TransactionType(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    @Column(name = "name", nullable = false, unique = true, length = 50)
    val name: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "flow", nullable = false)
    val flow: TransactionFlow,
)