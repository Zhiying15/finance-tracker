package com.finance.entity;

import com.fasterxml.jackson.databind.JsonNode
import com.finance.constants.ImportReviewStatus
import com.finance.constants.ReviewStatus
import io.hypersistence.utils.hibernate.type.json.JsonType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.Type
import java.time.LocalDateTime
import java.util.UUID

@Entity
@Table(name = "import_transactions")
class ImportTransaction(

    @Id
    @Column(name = "id", length = 36, updatable = false, nullable = false)
    val id: String = UUID.randomUUID().toString(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    val batch: ImportBatch,

    // Raw JSON string from Ollama — never exposed directly to frontend
    @Column(name = "json_data", columnDefinition = "JSON")
    val jsonData: String? = null,

    @Column(name = "parse_error", length = 500)
    val parseError: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(name = "review_status")
    var reviewStatus: ReviewStatus = ReviewStatus.NEW,

    @Column(name = "approved")
    var approved: Boolean = false,

    @Column(name = "created_at", updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
)
