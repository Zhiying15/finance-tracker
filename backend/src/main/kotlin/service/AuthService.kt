package com.finance.service

import com.finance.dto.request.SignInRequest
import com.finance.dto.request.UserRequest
import com.finance.dto.response.UserResponse
import com.finance.security.UserPrincipal
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpSession

interface AuthService {
    fun register(request: UserRequest): UserResponse
    fun login(request: SignInRequest, httpRequest: HttpServletRequest): UserResponse
    fun logout(session: HttpSession?)
    fun getCurrentUser(principal: UserPrincipal): UserResponse
}