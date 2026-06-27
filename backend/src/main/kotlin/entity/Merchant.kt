package com.finance.entity

import jakarta.persistence.Entity
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "merchants")
data class Merchant(

    @ManyToOne
    @JoinColumn(name = "user_id")
    var user: User,

    var merchantName: String,

    var normalizedName: String

) : BaseEntity()