package transaction.controller

import common.utility.SecurityUtils
import transaction.dto.request.TransactionRequest
import transaction.dto.request.TransactionUpdateRequest
import transaction.dto.response.TransactionResponse
import transaction.dto.response.TransactionSummaryResponse
import transaction.service.TransactionService
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
@RequestMapping("/transactions")
class TransactionController(
    private val transactionService: TransactionService,
) {

    // GET /api/transactions
    // All transactions for the current user, newest first
    @GetMapping
    fun listTransactions(
        session: HttpSession?,
    ): ResponseEntity<List<TransactionResponse>> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(transactionService.listTransactions(user.userId))
    }

    // GET /api/transactions?year=2025&month=6
    // Transactions filtered by month — used by monthly summary screen
    @GetMapping("/by-period")
    fun listTransactionsByPeriod(
        session: HttpSession?,
        @RequestParam year: Int,
        @RequestParam month: Int,
    ): ResponseEntity<List<TransactionResponse>> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(
            transactionService.listTransactionsByPeriod(user.userId, year, month)
        )
    }

    // GET /api/transactions/by-account/{accountId}
    // All transactions that involve a specific account (from or to)
    @GetMapping("/by-account/{accountId}")
    fun listTransactionsByAccount(
        session: HttpSession?,
        @PathVariable accountId: String,
    ): ResponseEntity<List<TransactionResponse>> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(
            transactionService.listTransactionsByAccount(user.userId, accountId)
        )
    }

    // GET /api/transactions/summary?year=2025&month=6
    // Monthly budget summary — income, spend by bucket, spare cash, net worth
    @GetMapping("/summary")
    fun getMonthlySummary(
        session: HttpSession?,
        @RequestParam year: Int,
        @RequestParam month: Int,
    ): ResponseEntity<TransactionSummaryResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(
            transactionService.getMonthlySummary(user.userId, year, month)
        )
    }

    // GET /api/transactions/{transactionId}
    @GetMapping("/{transactionId}")
    fun getTransaction(
        session: HttpSession?,
        @PathVariable transactionId: String,
    ): ResponseEntity<TransactionResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(transactionService.getTransaction(user.userId, transactionId))
    }

    // POST /api/transactions
    // Manual transaction entry — immediately approved, balance updated instantly
    @PostMapping
    fun createTransaction(
        session: HttpSession?,
        @Valid @RequestBody request: TransactionRequest,
    ): ResponseEntity<TransactionResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(transactionService.createManualTransaction(user.userId, request))
    }

    // PATCH /api/transactions/{transactionId}
    // Update description, remarks, budgetType, date — amount and accounts are immutable
    @PatchMapping("/{transactionId}")
    fun updateTransaction(
        session: HttpSession?,
        @PathVariable transactionId: String,
        @Valid @RequestBody request: TransactionUpdateRequest,
    ): ResponseEntity<TransactionResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(
            transactionService.updateTransaction(user.userId, transactionId, request)
        )
    }

    // DELETE /api/transactions/{transactionId}
    // Hard delete — reverses account balance change
    @DeleteMapping("/{transactionId}")
    fun deleteTransaction(
        session: HttpSession?,
        @PathVariable transactionId: String,
    ): ResponseEntity<Unit> {
        val user = SecurityUtils.resolveCurrentUser(session)
        transactionService.deleteTransaction(user.userId, transactionId)
        return ResponseEntity.noContent().build()
    }
}