package com.finance.importing.controller

import com.finance.common.utility.SecurityUtils
import com.finance.importing.dto.BulkActionResult
import com.finance.importing.dto.request.ImportTransactionUpdateRequest
import com.finance.importing.dto.response.ImportFileResponse
import com.finance.importing.dto.response.ImportTransactionReviewResponse
import com.finance.importing.service.ImportService
import jakarta.servlet.http.HttpSession
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/import")
class ImportController(
    private val importService: ImportService,
) {

    // POST /api/import/upload?accountId=
    // Accepts multipart CSV — returns immediately with fileId (async parse kicks off)
    @PostMapping("/upload")
    fun uploadFile(
        session: HttpSession?,
        @RequestParam("file") file: MultipartFile,
        @RequestParam("accountId") accountId: String,
    ): ResponseEntity<ImportFileResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        val response = importService.uploadFile(user.userId, file, accountId)
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response)
    }

    // GET /api/import/files
    // List all uploaded files for the user — with row counts and status
    @GetMapping("/files")
    fun listFiles(
        session: HttpSession?,
    ): ResponseEntity<List<ImportFileResponse>> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(importService.listFiles(user.userId))
    }

    // GET /api/import/files/{fileId}
    // Poll this endpoint to check parse status (PROCESSING → PENDING_REVIEW)
    @GetMapping("/files/{fileId}")
    fun getFile(
        session: HttpSession?,
        @PathVariable fileId: String,
    ): ResponseEntity<ImportFileResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(importService.getFile(user.userId, fileId))
    }

    // GET /api/import/files/{fileId}/rows
    // All parsed rows for review — includes parse errors, duplicates, clean rows
    @GetMapping("/files/{fileId}/rows")
    fun getReviewItems(
        session: HttpSession?,
        @PathVariable fileId: String,
    ): ResponseEntity<List<ImportTransactionReviewResponse>> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(importService.getReviewItems(user.userId, fileId))
    }

    // PUT /api/import/files/{fileId}/rows/{importTxId}
    // Edit a parsed row before approving — fixes parse errors or corrections
    @PutMapping("/files/{fileId}/rows/{importTxId}")
    fun updateRow(
        session: HttpSession?,
        @PathVariable fileId: String,
        @PathVariable importTxId: String,
        @Valid @RequestBody request: ImportTransactionUpdateRequest,
    ): ResponseEntity<ImportTransactionReviewResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(
            importService.updateReviewRow(user.userId, fileId, importTxId, request)
        )
    }

    // POST /api/import/files/{fileId}/rows/{importTxId}/approve?accountId=
    // Approve single row — promotes to transactions, updates account balance
    @PostMapping("/files/{fileId}/rows/{importTxId}/approve")
    fun approveRow(
        session: HttpSession?,
        @PathVariable fileId: String,
        @PathVariable importTxId: String,
        @RequestParam("accountId") accountId: String,
    ): ResponseEntity<ImportTransactionReviewResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.status(HttpStatus.CREATED).body(
            importService.approveRow(user.userId, fileId, importTxId, accountId)
        )
    }

    // POST /api/import/files/{fileId}/rows/{importTxId}/reject
    // Reject single row — will not be added to ledger
    @PostMapping("/files/{fileId}/rows/{importTxId}/reject")
    fun rejectRow(
        session: HttpSession?,
        @PathVariable fileId: String,
        @PathVariable importTxId: String,
    ): ResponseEntity<ImportTransactionReviewResponse> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(
            importService.rejectRow(user.userId, fileId, importTxId)
        )
    }

    // POST /api/import/files/{fileId}/bulk-approve?accountId=
    // Bulk approve all NEW rows — skips POSSIBLE_DUPLICATE (requires individual review)
    @PostMapping("/files/{fileId}/bulk-approve")
    fun bulkApproveNew(
        session: HttpSession?,
        @PathVariable fileId: String,
        @RequestParam("accountId") accountId: String,
    ): ResponseEntity<BulkActionResult> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(
            importService.bulkApproveNew(user.userId, fileId, accountId)
        )
    }

    // POST /api/import/files/{fileId}/bulk-reject
    // Bulk reject all NEW rows
    @PostMapping("/files/{fileId}/bulk-reject")
    fun bulkRejectNew(
        session: HttpSession?,
        @PathVariable fileId: String,
    ): ResponseEntity<BulkActionResult> {
        val user = SecurityUtils.resolveCurrentUser(session)
        return ResponseEntity.ok(
            importService.bulkRejectNew(user.userId, fileId)
        )
    }
}