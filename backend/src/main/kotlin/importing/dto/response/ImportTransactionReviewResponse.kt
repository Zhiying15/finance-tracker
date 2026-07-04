package importing.dto.response

import common.constants.ReviewStatus
import importing.dto.ParsedTransactionFields
import entity.ImportedTransaction
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime

data class ImportTransactionReviewResponse(
    val id: String,
    val fileId: String,
    val reviewStatus: ReviewStatus,
    val approved: Boolean,

    // Parsed fields — shown as editable form fields in UI
    // null means Ollama could not extract the field
    val transactionDate: LocalDate?,
    val description: String?,
    val amount: BigDecimal?,

    // true = money coming IN to the account (credit)
    // false = money going OUT of the account (debit)
    val isInflow: Boolean?,
    val currency: String?,

    // Non-null if Ollama failed to parse this row entirely
    val parseError: String?,

    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
) {
    companion object {
        fun from(
            entity: ImportedTransaction,
            parsed: ParsedTransactionFields?,
        ) = ImportTransactionReviewResponse(
            id              = entity.id,
            fileId          = entity.file.id,
            reviewStatus    = entity.reviewStatus,
            approved        = entity.approved,
            transactionDate = parsed?.transactionDate,
            description     = parsed?.description,
            amount          = parsed?.amount,
            isInflow        = parsed?.isInflow,
            currency        = parsed?.currency,
            parseError      = entity.parseError,
            createdAt       = entity.createdAt,
            updatedAt       = entity.updatedAt,
        )
    }
}
