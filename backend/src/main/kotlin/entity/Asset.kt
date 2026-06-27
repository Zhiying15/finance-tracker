package com.finance.entity

import com.fasterxml.jackson.databind.JsonNode
import com.finance.constants.RuleType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.math.BigDecimal
import java.util.UUID

@Entity
@Table(name = "assets")
class Asset(

    @Id
    var id: UUID = UUID.randomUUID(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    var user: User? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_type_id")
    var assetType: AssetType? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    var account: Account? = null,

    var name: String? = null,
    var provider: String? = null,

    var currentValue: BigDecimal? = null,

    @Column(columnDefinition = "json")
    var metadata: JsonNode? = null

) : BaseEntity()