package com.finance.account.controller

import com.finance.account.dto.request.AccountRequest
import com.finance.account.dto.request.AccountUpdateRequest
import com.finance.account.dto.response.AccountResponse
import com.finance.account.dto.response.AccountTypeResponse
import com.finance.account.dto.response.NetWorthResponse
import com.finance.account.service.AccountService
import com.finance.user.security.UserPrincipal
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/accounts")
//@EnableMethodSecurity
class AccountController(
    private val accountService: AccountService,
) {

    // GET /api/accounts/types
    // Public reference data for account creation form dropdowns
    @GetMapping("/types")
//    @PreAuthorize("hasRole('ADMIN')")
    fun listAccountTypes(): ResponseEntity<List<AccountTypeResponse>> =
        ResponseEntity.ok(accountService.listAccountTypes())

    // GET /api/accounts
    // Returns active accounts by default; pass ?includeInactive=true for all
    @GetMapping
    fun listAccounts(
        @AuthenticationPrincipal user: UserPrincipal,
        @RequestParam(defaultValue = "false") includeInactive: Boolean,
    ): ResponseEntity<List<AccountResponse>> {
        return ResponseEntity.ok(accountService.listAccounts(user.userId, includeInactive))
    }

    // GET /api/accounts/net-worth
    // Summary of assets, liabilities, net worth + breakdown by asset class
    @GetMapping("/net-worth")
    fun getNetWorth(@AuthenticationPrincipal user: UserPrincipal): ResponseEntity<NetWorthResponse> {
        return ResponseEntity.ok(accountService.getNetWorth(user.userId))
    }

    // GET /api/accounts/{accountId}
    @GetMapping("/{accountId}")
    fun getAccount(
        @AuthenticationPrincipal user: UserPrincipal,
        @PathVariable accountId: String,
    ): ResponseEntity<AccountResponse> {
        return ResponseEntity.ok(accountService.getAccount(user.userId, accountId))
    }

    // POST /api/accounts
    @PostMapping
    fun createAccount(
        @AuthenticationPrincipal user: UserPrincipal,
        @Valid @RequestBody request: AccountRequest,
    ): ResponseEntity<AccountResponse> {
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(accountService.createAccount(user.userId, request))
    }

    // PATCH /api/accounts/{accountId}
    @PatchMapping("/{accountId}")
    fun updateAccount(
        @AuthenticationPrincipal user: UserPrincipal,
        @PathVariable accountId: String,
        @Valid @RequestBody request: AccountUpdateRequest,
    ): ResponseEntity<AccountResponse> {
        return ResponseEntity.ok(accountService.updateAccount(user.userId, accountId, request))
    }

    // DELETE /api/accounts/{accountId}
    // Soft delete — sets is_active = false, preserves transaction history
    @DeleteMapping("/{accountId}")
    fun deactivateAccount(
        @AuthenticationPrincipal user: UserPrincipal,
        @PathVariable accountId: String,
    ): ResponseEntity<Unit> {
        accountService.deactivateAccount(user.userId, accountId)
        return ResponseEntity.noContent().build()
    }

    // PATCH /api/accounts/{accountId}/reactivate
    @PatchMapping("/{accountId}/reactivate")
    fun reactivateAccount(
        @AuthenticationPrincipal user: UserPrincipal,
        @PathVariable accountId: String,
    ): ResponseEntity<AccountResponse> {
        return ResponseEntity.ok(accountService.reactivateAccount(user.userId, accountId))
    }
}