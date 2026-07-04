package account.controller

import com.finance.account.service.AccountService
import account.dto.request.AccountRequest
import account.dto.request.AccountUpdateRequest
import account.dto.response.AccountResponse
import account.dto.response.AccountTypeResponse
import account.dto.response.NetWorthResponse
import common.utility.SecurityUtils
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
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
class AccountController(
    private val accountService: AccountService,
) {

    // GET /api/accounts/types
    // Public reference data for account creation form dropdowns
    @GetMapping("/types")
    fun listAccountTypes(): ResponseEntity<List<AccountTypeResponse>> =
        ResponseEntity.ok(accountService.listAccountTypes())

    // GET /api/accounts
    // Returns active accounts by default; pass ?includeInactive=true for all
    @GetMapping
    fun listAccounts(
        session: HttpSession?,
        @RequestParam(defaultValue = "false") includeInactive: Boolean,
    ): ResponseEntity<List<AccountResponse>> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(accountService.listAccounts(user.userId, includeInactive))
    }

    // GET /api/accounts/net-worth
    // Summary of assets, liabilities, net worth + breakdown by asset class
    @GetMapping("/net-worth")
    fun getNetWorth(session: HttpSession?): ResponseEntity<NetWorthResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(accountService.getNetWorth(user.userId))
    }

    // GET /api/accounts/{accountId}
    @GetMapping("/{accountId}")
    fun getAccount(
        session: HttpSession?,
        @PathVariable accountId: String,
    ): ResponseEntity<AccountResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(accountService.getAccount(user.userId, accountId))
    }

    // POST /api/accounts
    @PostMapping
    fun createAccount(
        session: HttpSession?,
        @Valid @RequestBody request: AccountRequest,
    ): ResponseEntity<AccountResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(accountService.createAccount(user.userId, request))
    }

    // PATCH /api/accounts/{accountId}
    @PatchMapping("/{accountId}")
    fun updateAccount(
        session: HttpSession?,
        @PathVariable accountId: String,
        @Valid @RequestBody request: AccountUpdateRequest,
    ): ResponseEntity<AccountResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(accountService.updateAccount(user.userId, accountId, request))
    }

    // DELETE /api/accounts/{accountId}
    // Soft delete — sets is_active = false, preserves transaction history
    @DeleteMapping("/{accountId}")
    fun deactivateAccount(
        session: HttpSession?,
        @PathVariable accountId: String,
    ): ResponseEntity<Unit> {
        val user = SecurityUtils.resolveCurrentUser(session)
        accountService.deactivateAccount(user.userId, accountId)
        return ResponseEntity.noContent().build()
    }

    // PATCH /api/accounts/{accountId}/reactivate
    @PatchMapping("/{accountId}/reactivate")
    fun reactivateAccount(
        session: HttpSession?,
        @PathVariable accountId: String,
    ): ResponseEntity<AccountResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(accountService.reactivateAccount(user.userId, accountId))
    }
}