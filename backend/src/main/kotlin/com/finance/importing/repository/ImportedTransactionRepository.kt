package com.financeimporting.repository

import common.constants.ReviewStatus
import entity.ImportedTransaction
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import java.math.BigDecimal
import java.time.LocalDate

@Repository
interface ImportedTransactionRepository : JpaRepository<ImportedTransaction, String> {

    fun findAllByFileIdOrderByCreatedAtAsc(fileId: String): List<ImportedTransaction>

    fun findByIdAndFileId(id: String, fileId: String): ImportedTransaction?

    // Counts per status — used to build ImportFileResponse stats
    fun countByFileId(fileId: String): Int

    fun countByFileIdAndReviewStatus(fileId: String, reviewStatus: ReviewStatus): Int

    fun countByFileIdAndApprovedTrue(fileId: String): Int

    fun countByFileIdAndParseErrorIsNotNull(fileId: String): Int

    // All NEW rows for bulk approve — excludes duplicates intentionally
    fun findAllByFileIdAndReviewStatus(
        fileId: String,
        reviewStatus: ReviewStatus,
    ): List<ImportedTransaction>

    // Duplicate detection — match on amount + date + description within user's transactions
    @Query(
        value = """
            SELECT COUNT(*) > 0
            FROM transactions t
            WHERE t.user_id          = :userId
              AND t.amount           = :amount
              AND t.transaction_date = :transactionDate
              AND t.description      = :description
        """,
        nativeQuery = true,
    )
    fun existsDuplicate(
        @Param("userId") userId: String,
        @Param("amount") amount: BigDecimal,
        @Param("transactionDate") transactionDate: LocalDate,
        @Param("description") description: String,
    ): Boolean
}