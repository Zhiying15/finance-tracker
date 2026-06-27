package com.finance.entity

import jakarta.persistence.Entity
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "import_batches")
data class ImportBatch(

    @ManyToOne
    @JoinColumn(name = "user_id")
    var user: User,

    var filename: String,

    var status: String = "UPLOADED"

) : BaseEntity()