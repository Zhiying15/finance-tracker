package com.finance.service.impl

import com.finance.dto.request.AccountRequest
import com.finance.dto.response.AccountResponse
import com.finance.entity.Account
import com.finance.exception.AppException
import com.finance.repository.AccountRepository
import com.finance.repository.AccountTypeRepository
import com.finance.repository.UserRepository
import com.finance.service.AccountService
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class AccountServiceImpl(
    private val accountRepository: AccountRepository,
    private val accountTypeRepository: AccountTypeRepository,
    private val userRepository: UserRepository,
) : AccountService {

    private val log = LoggerFactory.getLogger(javaClass)

    @Transactional(readOnly = true)
    override fun listAccounts(userId: String): List<AccountResponse> =
        accountRepository.findAllByUserIdAndIsActiveTrue(userId)
            .map { AccountResponse.from(it) }

    @Transactional
    override fun createAccount(userId: String, request: AccountRequest): AccountResponse {
        val user = userRepository.findById(userId)
            .orElseThrow { AppException.NotFound("User not found") }

        val accountType = accountTypeRepository.findById(request.accountTypeId)
            .orElseThrow { AppException.NotFound("Account type '${request.accountTypeId}' not found") }

        val currency = accountRepository.findCurrencyByCode(request.currencyCode)
            ?: throw AppException.NotFound("Currency '${request.currencyCode}' not found")

        val entity = Account(
            user = user,
            accountType = accountType,
            name = request.name.trim(),
            institution = request.institution?.trim(),
            accountNumber = request.accountNumber?.trim(),
            currency = currency,
            currentBalance = request.currentBalance,
            manualValuation = request.manualValuation,
            lastValuationDate = request.lastValuationDate,
            includeInNetWorth = request.includeInNetWorth,
            notes = request.notes?.trim(),
        )

        return AccountResponse.from(accountRepository.save(entity))
    }

    @Transactional
    override fun deactivateAccount(userId: String, accountId: String) {
        val account = accountRepository.findByIdAndUserId(accountId, userId)
            ?: throw AppException.Forbidden("Account not found or access denied")

        account.isActive = false
        // updatedAt is handled automatically by @PreUpdate in BaseEntity — no manual set needed
        accountRepository.save(account)
    }

    @Transactional(readOnly = true)
    override fun getAccount(userId: String, accountId: String): AccountResponse {
        val account = accountRepository.findByIdAndUserId(accountId, userId)
            ?: throw AppException.Forbidden("Account not found or access denied")
        return AccountResponse.from(account)
    }
}