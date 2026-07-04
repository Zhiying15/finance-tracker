package user.security

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
) : Serializable {
    companion object {
        private const val serialVersionUID: Long = 1L
    }
}