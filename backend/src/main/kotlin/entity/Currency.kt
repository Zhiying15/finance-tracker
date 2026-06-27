package com.finance.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "currencies")
class Currency(

    @Id
    @Column(length = 3)
    var code: String,

    var name: String,

    var symbol: String? = null
)