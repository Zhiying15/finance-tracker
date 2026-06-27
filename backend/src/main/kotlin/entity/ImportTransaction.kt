package com.finance.entity;

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table

@Entity
@Table(name = "import_transactions")
data class ImportTransaction(

    @ManyToOne
    @JoinColumn(name = "batch_id")
    var batch:ImportBatch,

    @Column(columnDefinition = "json")
    var jsonData: String,

    var approved: Boolean = false

) : BaseEntity()
