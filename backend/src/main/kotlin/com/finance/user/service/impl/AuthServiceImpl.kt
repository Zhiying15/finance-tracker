package com.finance.user.service.impl

import com.finance.common.constants.SessionConstant
import com.finance.common.exception.AppException
import com.finance.entity.User
import com.finance.user.dto.request.SignInRequest
import com.finance.user.dto.request.UserRequest
import com.finance.user.security.UserPrincipal
import com.finance.user.service.AuthService

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import org.slf4j.LoggerFactory
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import com.finance.user.dto.response.UserResponse
import com.finance.user.repository.UserRepository
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.context.HttpSessionSecurityContextRepository

@Service
class AuthServiceImpl(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
) : AuthService {

    private val log = LoggerFactory.getLogger(javaClass)
    // Create an instance of the security repository
    private val securityContextRepository = HttpSessionSecurityContextRepository()


    @Transactional
    override fun register(request: UserRequest): UserResponse {
        if (userRepository.existsByEmail(request.email)) {
            throw AppException.Conflict("An account with this email already exists")
        }

        val user = User(
            email = request.email.lowercase().trim(),
            passwordHash = passwordEncoder.encode(request.password),
            fullName = request.fullName?.trim(),
        )

        val saved = userRepository.save(user)

        return UserResponse(
            userId = saved.id,
            email = saved.email,
            fullName = saved.fullName,
        )
    }

    @Transactional(readOnly = true)
    override fun login(request: SignInRequest, httpRequest: HttpServletRequest): UserResponse {
        val user = userRepository.findByEmail(request.email.lowercase().trim())
            .orElseThrow { AppException.Unauthorized("Invalid email or password") }

        if (!passwordEncoder.matches(request.password, user.passwordHash)) {
            throw AppException.Unauthorized("Invalid email or password")
        }

        // Invalidate any existing session before creating a new one (session fixation defence)
        httpRequest.getSession(false)?.invalidate()
        val session: HttpSession = httpRequest.getSession(true)

        val principal = UserPrincipal(
            userId = user.id,
            email = user.email,
            fullName = user.fullName,
        )
        session.setAttribute(SessionConstant.USER_PRINCIPAL_KEY, principal)
        // 2. CRUCIAL BRIDGE: Create an authenticated Spring Security token
        // Use user.authorities or emptyList() depending on whether your UserPrincipal implements UserDetails
        val authorities = emptyList<org.springframework.security.core.GrantedAuthority>()
        val authentication = UsernamePasswordAuthenticationToken(principal, null, authorities)

        // 3. Construct an explicit empty security context and populate it
        val context = SecurityContextHolder.createEmptyContext().apply {
            this.authentication = authentication
        }
        SecurityContextHolder.setContext(context)

        // 4. Force save the context back into the HTTP Session context repository
        // This pushes the required "SPRING_SECURITY_CONTEXT" structural key to Redis
        securityContextRepository.saveContext(context, httpRequest, null)


        return UserResponse(
            userId = user.id,
            email = user.email,
            fullName = user.fullName,
        )
    }

    override fun logout(session: HttpSession) {
        session.invalidate()
    }

    @Transactional(readOnly = true)
    override fun getCurrentUser(principal: UserPrincipal): UserResponse {
        // Re-validate user still exists in DB (guards against deleted accounts with active sessions)
        val user = userRepository.findById(principal.userId)
            .orElseThrow { AppException.Unauthorized("Session is no longer valid") }

        return UserResponse(
            userId = user.id,
            email = user.email,
            fullName = user.fullName,
        )
    }
}