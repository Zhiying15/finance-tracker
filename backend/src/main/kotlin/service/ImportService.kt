package com.finance.service

import com.finance.dto.request.ImportTransactionReviewItem
import com.finance.dto.request.ImportTransactionUpdateRequest
import com.finance.entity.ImportBatch
import com.finance.entity.User
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile

@Service
interface ImportService {
    fun uploadFile(userId: String, file: MultipartFile, accountId: String): String
    fun getBatchReviewItems(userId: String, batchId: String): List<ImportTransactionReviewItem>
    fun updateImportTransaction(
        userId: String,
        batchId: String,
        importTxId: String,
        request: ImportTransactionUpdateRequest,
    ): ImportTransactionReviewItem
    fun approveImportTransaction(
        userId: String,
        batchId: String,
        importTxId: String,
        accountId: String,
    ): String
    fun rejectImportTransaction(userId: String, batchId: String, importTxId: String)
}