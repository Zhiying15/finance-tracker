package com.finance.user.controller

import com.finance.common.constants.APIConstant
import com.finance.common.constants.SessionConstant
import com.finance.common.exception.AppException
import com.finance.user.dto.request.SignInRequest
import com.finance.user.dto.request.UserRequest
import com.finance.user.dto.response.UserResponse
import com.finance.user.security.UserPrincipal
import com.finance.user.service.AuthService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

// 2. Class-level annotations for routing
@RestController
@RequestMapping("/auth")
class UserController(
    private val authService: AuthService,
) {

    @PostMapping(APIConstant.REGISTER)
    fun register(
        @Valid @RequestBody request: UserRequest,
    ): ResponseEntity<UserResponse> {
        val response = authService.register(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(response)
    }

    @PostMapping(APIConstant.LOGIN)
    fun login(
        @Valid @RequestBody request: SignInRequest,
        httpRequest: HttpServletRequest,
    ): ResponseEntity<UserResponse> {
        val response = authService.login(request, httpRequest)
        return ResponseEntity.ok(response)
    }

    @PostMapping(APIConstant.LOGOUT)
    fun logout(session: HttpSession?): ResponseEntity<Unit> {
        authService.logout(session)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/me")
    fun getCurrentUser(session: HttpSession?): ResponseEntity<UserResponse> {
        val principal = session
            ?.getAttribute(SessionConstant.USER_PRINCIPAL_KEY) as? UserPrincipal
            ?: throw AppException.Unauthorized("No active session")

        return ResponseEntity.ok(authService.getCurrentUser(principal))
    }
}