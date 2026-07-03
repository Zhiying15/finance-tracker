package com.finance.entity;

import com.finance.constants.ReviewStatus
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "imported_transactions")
class ImportedTransaction(

    @Id
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    val id: String = UUID.randomUUID().toString(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    val file: ImportedFile,

    @Column(name = "json_data", columnDefinition = "JSON")
    var jsonData: String? = null,

    @Column(name = "parse_error", length = 500)
    var parseError: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "review_status")
    var reviewStatus: ReviewStatus = ReviewStatus.NEW,

    @Column(name = "approved")
    var approved: Boolean = false,

    ) : BaseEntity()
