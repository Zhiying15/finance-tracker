package com.finance.controller

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

// 1. Data class representing our payload
data class User(val id: Long, val name: String)

// 2. Class-level annotations for routing
@RestController
@RequestMapping("/finance-tracker/users")
class Controller {

    // GET request to /api/users
    @GetMapping
    fun getAllUsers(): List<User> {
        return listOf(
            User(1, "Alice"),
            User(2, "Bob")
        )
    }

    // GET request with a path variable (e.g., /api/users/5)
    @GetMapping("/{id}")
    fun getUserById(@PathVariable id: Long): ResponseEntity<User> {
        val user = User(id, "User-$id")
        return ResponseEntity.ok(user)
    }

    // POST request to /api/users with a request body
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun createUser(@RequestBody user: User): User {
        // Kotlin allows single-expression functions using '='
        return user
    }
}
