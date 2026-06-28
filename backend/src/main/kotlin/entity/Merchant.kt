package com.finance.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint

@Entity
@Table(
    name = "merchants",
    uniqueConstraints = [
        UniqueConstraint(columnNames = ["user_id", "merchant_name"])
    ]
)
class Merchant(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    val user: User? = null,

    @Column(name = "merchant_name", length = 200)
    val merchantName: String? = null,

    @Column(name = "normalized_name", length = 200)
    val normalizedName: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_category_id")
    val defaultCategory: Category? = null,
)