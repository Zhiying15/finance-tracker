package transaction.service

import transaction.dto.request.TransactionRequest
import transaction.dto.request.TransactionUpdateRequest
import transaction.dto.response.TransactionResponse
import transaction.dto.response.TransactionSummaryResponse
import org.springframework.stereotype.Service

@Service
interface TransactionService {
    fun listTransactions(userId: String): List<TransactionResponse>
    fun listTransactionsByPeriod(userId: String, year: Int, month: Int, ): List<TransactionResponse>
    fun listTransactionsByAccount(userId: String, accountId: String): List<TransactionResponse>
    fun getTransaction(userId: String, transactionId: String): TransactionResponse
    fun getMonthlySummary(userId: String, year: Int, month: Int): TransactionSummaryResponse
    fun createManualTransaction(userId: String, request: TransactionRequest, ): TransactionResponse
    fun updateTransaction(userId: String, transactionId: String, request: TransactionUpdateRequest): TransactionResponse
    fun deleteTransaction(userId: String, transactionId: String)

}