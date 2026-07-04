package com.finance.user.service

import user.dto.request.SignInRequest
import com.finance.user.dto.request.UserRequest
import com.finance.user.security.UserPrincipal
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession
import com.finance.user.dto.response.UserResponse

interface AuthService {
    fun register(request: UserRequest): UserResponse
    fun login(request: SignInRequest, httpRequest: HttpServletRequest): UserResponse
    fun logout(session: HttpSession?)
    fun getCurrentUser(principal: UserPrincipal): UserResponse
}