package com.finance.account.service

import account.dto.request.AccountRequest
import account.dto.request.AccountUpdateRequest
import account.dto.response.AccountResponse
import account.dto.response.AccountTypeResponse
import account.dto.response.NetWorthResponse
import entity.Account
import org.springframework.stereotype.Service

@Service
interface AccountService {
    fun listAccountTypes(): List<AccountTypeResponse>
    fun listAccounts(userId: String, includeInactive: Boolean): List<AccountResponse>
    fun getAccount(userId: String, accountId: String): AccountResponse
    fun getNetWorth(userId: String): NetWorthResponse
    fun createAccount(userId: String, request: AccountRequest): AccountResponse
    fun updateAccount(userId: String, accountId: String, request: AccountUpdateRequest): AccountResponse

    fun deactivateAccount(userId: String, accountId: String)
    fun reactivateAccount(userId: String, accountId: String): AccountResponse
    fun findOwnedAccount(userId: String, accountId: String): Account
}