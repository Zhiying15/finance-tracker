package com.finance.repository

import com.finance.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional
import java.util.UUID

interface UserRepository : JpaRepository<User, String> {
    fun findByEmail(email: String): User?
    override fun findById(id: String): Optional<User?>
}