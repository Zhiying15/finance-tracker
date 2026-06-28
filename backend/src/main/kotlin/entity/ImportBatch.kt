package com.finance.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "import_batches")
class ImportBatch(

    @Id
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    val id: String = UUID.randomUUID().toString(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    val user: User,

    @Column(name = "filename", length = 255)
    val filename: String? = null,

    @Column(name = "status", length = 50)
    var status: String = "PROCESSING",

    @Column(name = "uploaded_at", updatable = false)
    val uploadedAt: LocalDateTime = LocalDateTime.now(),

) : BaseEntity()