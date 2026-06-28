package com.finance.controller

import com.finance.dto.request.ImportTransactionReviewItem
import com.finance.dto.request.ImportTransactionUpdateRequest
import com.finance.service.ImportService
import com.finance.utility.SecurityUtils
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/finance-tracker/import")
class ImportController(private val importService: ImportService) {

    @PostMapping("/upload")
    fun uploadFile(
        session: HttpSession?,
        @RequestParam("file") file: MultipartFile,
        @RequestParam("accountId") accountId: String,
    ): ResponseEntity<Map<String, String>> {
        val user = SecurityUtils.resolveCurrentUser(session)
        val batchId = importService.uploadFile(user.userId, file, accountId)
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(mapOf("batchId" to batchId))
    }

    @GetMapping("/batches/{batchId}/review")
    fun getReviewItems(
        session: HttpSession?,
        @PathVariable batchId: String,
    ): ResponseEntity<List<ImportTransactionReviewItem>> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(importService.getBatchReviewItems(user.userId, batchId))
    }

    @PutMapping("/batches/{batchId}/transactions/{importTxId}")
    fun updateImportTransaction(
        session: HttpSession?,
        @PathVariable batchId: String,
        @PathVariable importTxId: String,
        @Valid @RequestBody request: ImportTransactionUpdateRequest,
    ): ResponseEntity<ImportTransactionReviewItem> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(importService.updateImportTransaction(user.userId, batchId, importTxId, request))
    }

    @PostMapping("/batches/{batchId}/transactions/{importTxId}/approve")
    fun approveImportTransaction(
        session: HttpSession?,
        @PathVariable batchId: String,
        @PathVariable importTxId: String,
        @RequestParam("accountId") accountId: String,
    ): ResponseEntity<Map<String, String>> {
        val user = SecurityUtils.resolveCurrentUser(session)
        val transactionId = importService.approveImportTransaction(user.userId, batchId, importTxId, accountId)
        return ResponseEntity.status(HttpStatus.CREATED).body(mapOf("transactionId" to transactionId))
    }

    @PostMapping("/batches/{batchId}/transactions/{importTxId}/reject")
    fun rejectImportTransaction(
        session: HttpSession?,
        @PathVariable batchId: String,
        @PathVariable importTxId: String,
    ): ResponseEntity<Unit> {
        val user = SecurityUtils.resolveCurrentUser(session)
        importService.rejectImportTransaction(user.userId, batchId, importTxId)
        return ResponseEntity.noContent().build()
    }
}