package com.finance.service.impl

import com.finance.constants.TransactionStatus
import com.finance.entity.Transaction
import com.finance.repository.TransactionsRepository
import com.finance.service.TransactionsService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class TransactionsServiceImpl : TransactionsService{

    companion object {
        // Replaces Lombok's @Slf4j log instance
        private val log = LoggerFactory.getLogger(TransactionsServiceImpl::class.java)
    }

    @Autowired
    private lateinit var transactionRepo: TransactionsRepository

    override fun create(tx: Transaction): Transaction {
        return transactionRepo.save(tx)
    }

    override fun getAll(userId: String): List<Transaction> {
        return transactionRepo.findByUserId(userId)
    }

    override fun approve(id: String) {
        val tx = transactionRepo.findById(id)
        if (tx != null) {
            // ❌ Code to execute if the value EXISTS goes here
            tx.status = TransactionStatus.APPROVED
            transactionRepo.save(tx)
        } else {
            // ❓ Code to execute if the value IS MISSING goes here
            println("Transaction does not exist")
        }
    }
}