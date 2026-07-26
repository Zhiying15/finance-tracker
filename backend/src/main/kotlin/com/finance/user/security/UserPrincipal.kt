package com.finance.user.security

import com.finance.common.constants.UserRole
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import java.io.Serializable

/**
 * Provider-agnostic principal stored in the Redis session.
 * Deliberately decoupled from UserEntity to allow future OAuth2 integration
 * without session contract changes.
 */
data class UserPrincipal(
    val userId: String,
    val email: String,
    val fullName: String?,
    val role: UserRole
) : UserDetails, Serializable { // 1. Add UserDetails interface

    companion object {
        private const val serialVersionUID: Long = 1L
    }

    // 2. Implement the required Spring Security methods
    override fun getAuthorities(): Collection<GrantedAuthority> {
        return listOf(SimpleGrantedAuthority(role.toString()))
    }
    override fun getPassword(): String? = null // Handled manually during login, no need to store hash in session

    override fun getUsername(): String = email // Spring Security treats email as the "username" field

    // 3. Set standard account lifecycle flags to true
    override fun isAccountNonExpired(): Boolean = true
    override fun isAccountNonLocked(): Boolean = true
    override fun isCredentialsNonExpired(): Boolean = true
    override fun isEnabled(): Boolean = true
}