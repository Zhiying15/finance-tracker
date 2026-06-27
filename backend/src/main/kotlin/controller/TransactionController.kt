package com.finance.controller

import com.finance.constants.APIConstant
import com.finance.dto.request.SignInRequest
import com.finance.dto.request.TransactionRequest
import com.finance.dto.request.UserRequest
import com.finance.dto.response.BaseResponse
import com.finance.entity.Transaction
import com.finance.entity.User
import com.finance.repository.TransactionRepository
import com.finance.service.AIParserService
import com.finance.service.TransactionsService
import jakarta.persistence.Access
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/finance-tracker/txn")
class TransactionController{
    @Autowired
    private lateinit var transactionService: TransactionsService

    @GetMapping(APIConstant.LIST_TRANSACTIONS)
    @ResponseStatus(HttpStatus.OK)
    fun listTransaction(
        @RequestHeader(name = "userIdentifier", required = true) userIdentifier: String ): List<Transaction> {
        return transactionService.listTransaction(userIdentifier)

    }

    @PostMapping(APIConstant.INSERT_TRANSACTION)
    @ResponseStatus(HttpStatus.CREATED)
    fun insert(@RequestBody transactionRequest: TransactionRequest): BaseResponse {
        return transactionService.insert(transactionRequest)
    }

    @PatchMapping(APIConstant.UPDATE_TRANSACTION)
    @ResponseStatus(HttpStatus.OK)
    fun updateTxnDetails(
        @RequestHeader(name = "txnIdentifier", required = true) txnIdentifier: String,
        @RequestBody transactionRequest: TransactionRequest): BaseResponse {
        return  transactionService.updateTxnDetails(transactionRequest)

    }

    @DeleteMapping(APIConstant.DELETE_TRANSACTION)
    @ResponseStatus(HttpStatus.OK)
    fun delete(@RequestHeader(name = "txnIdentifier", required = true) txnIdentifier: String,) : BaseResponse {
        return transactionService.delete(txnIdentifier)
    }
}