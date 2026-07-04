package entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "users")
class User(

    @Id
    @Column(name = "id", length = 36, nullable = false, updatable = false)
    val id: String = UUID.randomUUID().toString(),

    @Column(name = "email", nullable = false, unique = true, length = 255)
    val email: String,

    @Column(name = "password_hash", nullable = false, length = 255)
    val passwordHash: String,

    @Column(name = "full_name", length = 100)
    val fullName: String? = null,

) : BaseEntity()