package com.finance.entity;

import com.fasterxml.jackson.databind.JsonNode
import com.finance.constants.ImportReviewStatus
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
import java.util.UUID

@Entity
@Table(name = "import_transactions")
class ImportTransaction(

    @Id
    var id: String = UUID.randomUUID().toString(),

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    var batch: ImportBatch? = null,

    @Type(JsonType::class)
    @Column(columnDefinition = "json")
    var jsonData: JsonNode? = null,

    var approved: Boolean = false,

    @Enumerated(EnumType.STRING)
    var reviewStatus: ImportReviewStatus = ImportReviewStatus.NEW,
)
