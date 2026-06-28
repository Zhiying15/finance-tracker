package com.finance.exception

import org.springframework.http.HttpStatus

sealed class AppException(
    override val message: String,
    val status: HttpStatus,
) : RuntimeException(message) {

    class Conflict(message: String) : AppException(message, HttpStatus.CONFLICT)
    class Unauthorized(message: String) : AppException(message, HttpStatus.UNAUTHORIZED)
    class NotFound(message: String) : AppException(message, HttpStatus.NOT_FOUND)
    class BadRequest(message: String) : AppException(message, HttpStatus.BAD_REQUEST)
    class Forbidden(message: String) : AppException(message, HttpStatus.FORBIDDEN)
}