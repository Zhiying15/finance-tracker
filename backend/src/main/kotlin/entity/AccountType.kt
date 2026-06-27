package com.finance.entity

import com.finance.constants.AssetType
import com.finance.constants.CategoryType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "account_types")
class AccountType(

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int = 0,

    @Column(unique = true, nullable = false)
    var name: String,

    @Column(unique = true, nullable = false)
    @Enumerated(EnumType.STRING)
    var category: CategoryType,

    @Column(unique = true, nullable = false)
    @Enumerated(EnumType.STRING)
    var assetClass: AssetType
)