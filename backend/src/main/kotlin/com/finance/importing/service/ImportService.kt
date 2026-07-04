package com.financeimporting.service


import importing.dto.response.ImportFileResponse
import importing.dto.response.ImportTransactionReviewResponse
import entity.Account
import importing.dto.request.ImportTransactionUpdateRequest
import importing.dto.BulkActionResult
import org.springframework.web.multipart.MultipartFile

interface ImportService {
    fun uploadFile(userId: String, file: MultipartFile, accountId: String): ImportFileResponse
    fun parseFileAsync(fileId: String, content: String, userId: String, account: Account)
    fun listFiles(userId: String): List<ImportFileResponse>
    fun getFile(userId: String, fileId: String): ImportFileResponse
    fun getReviewItems(userId: String, fileId: String): List<ImportTransactionReviewResponse>
    fun updateReviewRow(userId: String, fileId: String, importTxId: String, request: ImportTransactionUpdateRequest): ImportTransactionReviewResponse
    fun approveRow(userId: String, fileId: String, importTxId: String, accountId: String): ImportTransactionReviewResponse
    fun rejectRow(userId: String, fileId: String, importTxId: String, ): ImportTransactionReviewResponse
    fun bulkApproveNew(userId: String, fileId: String, accountId: String): BulkActionResult
    fun bulkRejectNew(userId: String, fileId: String): BulkActionResult


}