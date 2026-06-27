package com.finance.entity

import jakarta.persistence.Column
import jakarta.persistence.Id
import jakarta.persistence.MappedSuperclass
import org.hibernate.annotations.CreationTimestamp
import java.time.LocalDateTime
import java.util.UUID

@MappedSuperclass
open class BaseEntity {
    @Id
    @Column(length = 36)
    var id: String = UUID.randomUUID().toString()

    @CreationTimestamp
    var createdAt: LocalDateTime? = null
}