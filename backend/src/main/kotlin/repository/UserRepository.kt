package com.finance.repository

import com.finance.entity.User
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<User, String> {
    fun findByEmail(email: String): Optional<User>
    fun existsByEmail(email: String): Boolean
}