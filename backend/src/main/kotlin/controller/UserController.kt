package com.finance.controller

import com.finance.entity.User
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

// 2. Class-level annotations for routing
@RestController
@RequestMapping("/finance-tracker/users")
class UserController {

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
