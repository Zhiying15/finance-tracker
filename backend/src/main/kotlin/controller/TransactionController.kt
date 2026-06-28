package com.finance.controller

import com.finance.dto.request.TransactionRequest
import com.finance.dto.request.TransactionUpdateRequest
import com.finance.dto.response.TransactionResponse
import com.finance.service.TransactionsService
import com.finance.utility.SecurityUtils
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/finance-tracker/txn")
class TransactionController(private val transactionService: TransactionsService) {

    @GetMapping
    fun listTransactions(session: HttpSession?): ResponseEntity<List<TransactionResponse>> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(transactionService.listTransactions(user.userId))
    }

    @PostMapping
    fun createTransaction(
        session: HttpSession?,
        @Valid @RequestBody request: TransactionRequest,
    ): ResponseEntity<TransactionResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(transactionService.createManualTransaction(user.userId, request))
    }

    @DeleteMapping("/{transactionId}/void")
    fun voidTransaction(
        session: HttpSession?,
        @PathVariable transactionId: String,
    ): ResponseEntity<Unit> {
        val user = SecurityUtils.resolveCurrentUser(session)
        transactionService.voidTransaction(user.userId, transactionId)
        return ResponseEntity.noContent().build()
    }

    // Add to TransactionController.kt

    @PatchMapping("/{transactionId}")
    fun updateTransaction(
        session: HttpSession?,
        @PathVariable transactionId: String,
        @RequestBody request: TransactionUpdateRequest,
    ): ResponseEntity<TransactionResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(transactionService.updateTransaction(user.userId, transactionId, request))
    }
}