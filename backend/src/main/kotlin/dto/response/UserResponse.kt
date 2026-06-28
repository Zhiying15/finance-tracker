package com.finance.dto.response

data class UserResponse(
    val userId: String,
    val email: String,
    val fullName: String?,
)