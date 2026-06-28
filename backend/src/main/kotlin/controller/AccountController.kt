package com.finance.controller

import com.finance.dto.request.AccountRequest
import com.finance.dto.response.AccountResponse
import com.finance.service.AccountService
import com.finance.utility.SecurityUtils
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/accounts")
class AccountController(private val accountService: AccountService) {

    @GetMapping
    fun listAccounts(session: HttpSession?): ResponseEntity<List<AccountResponse>> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(accountService.listAccounts(user.userId))
    }

    @GetMapping("/{accountId}")
    fun getAccount(
        session: HttpSession?,
        @PathVariable accountId: String,
    ): ResponseEntity<AccountResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(accountService.getAccount(user.userId, accountId))
    }

    @PostMapping
    fun createAccount(
        session: HttpSession?,
        @Valid @RequestBody request: AccountRequest,
    ): ResponseEntity<AccountResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(accountService.createAccount(user.userId, request))
    }

    @DeleteMapping("/{accountId}")
    fun deactivateAccount(
        session: HttpSession?,
        @PathVariable accountId: String,
    ): ResponseEntity<Unit> {
        val user = SecurityUtils.resolveCurrentUser(session)
        accountService.deactivateAccount(user.userId, accountId)
        return ResponseEntity.noContent().build()
    }
}