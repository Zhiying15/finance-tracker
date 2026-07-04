package entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "currencies")
class Currency(

    @Id
    @Column(name = "code", length = 3)
    val code: String,

    @Column(name = "name", nullable = false, length = 50)
    val name: String,

    @Column(name = "symbol", length = 10)
    val symbol: String? = null,
)