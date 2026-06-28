package com.finance.controller

import com.finance.constants.APIConstant
import com.finance.constants.SessionConstant
import com.finance.dto.request.SignInRequest
import com.finance.dto.request.UserRequest
import com.finance.dto.response.UserResponse
import com.finance.exception.AppException
import com.finance.security.UserPrincipal
import com.finance.service.AuthService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity

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