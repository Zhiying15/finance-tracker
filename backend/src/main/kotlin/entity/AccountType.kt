package entity

import common.constants.AccountCategory
import common.constants.AssetClass
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
    val id: Int = 0,

    @Column(name = "name", nullable = false, unique = true, length = 50)
    val name: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    val category: AccountCategory,

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_class", nullable = false)
    val assetClass: AssetClass,
) : BaseEntity()