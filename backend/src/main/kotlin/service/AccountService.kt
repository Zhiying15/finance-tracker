package com.finance.service

import com.finance.dto.request.AccountRequest
import com.finance.dto.response.AccountResponse
import org.springframework.stereotype.Service

@Service
interface AccountService {
    fun listAccounts(userId: String): List<AccountResponse>
    fun createAccount(userId: String, request: AccountRequest): AccountResponse
    fun deactivateAccount(userId: String, accountId: String)
    fun getAccount(userId: String, accountId: String): AccountResponse
}