package account.service.impl

import com.finance.account.service.AccountService
import common.constants.AccountCategory
import account.dto.request.AccountRequest
import account.dto.request.AccountUpdateRequest
import account.dto.response.AccountResponse
import account.dto.response.AccountTypeResponse
import account.dto.response.NetWorthResponse
import entity.Account
import entity.User
import common.exception.AppException
import account.repository.AccountRepository
import account.repository.AccountTypeRepository
import user.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
class AccountServiceImpl(
    private val accountRepository: AccountRepository,
    private val accountTypeRepository: AccountTypeRepository,
    private val userRepository: UserRepository,
) : AccountService {

    // -------------------------
    // Account Types (read-only)
    // -------------------------

    @Transactional(readOnly = true)
    override fun listAccountTypes(): List<AccountTypeResponse> =
        accountTypeRepository.findAllByOrderByNameAsc()
            .map { AccountTypeResponse.from(it) }

    // -------------------------
    // Accounts — Queries
    // -------------------------

    @Transactional(readOnly = true)
    override fun listAccounts(userId: String, includeInactive: Boolean): List<AccountResponse> {
        val accounts = if (includeInactive) {
            accountRepository.findAllByUserIdOrderByIsActiveDescNameAsc(userId)
        } else {
            accountRepository.findAllByUserIdAndIsActiveTrueOrderByNameAsc(userId)
        }
        return accounts.map { AccountResponse.from(it) }
    }

    @Transactional(readOnly = true)
    override fun getAccount(userId: String, accountId: String): AccountResponse {
        val account = findOwnedAccount(userId, accountId)
        return AccountResponse.from(account)
    }

    @Transactional(readOnly = true)
    override fun getNetWorth(userId: String): NetWorthResponse {
        val accounts = accountRepository
            .findAllByUserIdAndIsActiveTrueOrderByNameAsc(userId)
            .filter { it.includeInNetWorth }

        val totalAssets = accountRepository.sumAssetBalance(userId)
        val totalLiabilities = accountRepository.sumLiabilityBalance(userId)
        val netWorth = totalAssets - totalLiabilities

        // Group by asset_class for breakdown
        val breakdown = accounts
            .groupBy { it.accountType.assetClass }
            .map { (assetClass, groupedAccounts) ->
                NetWorthResponse.AssetClassBreakdown(
                    assetClass = assetClass.name,
                    category = groupedAccounts.first().accountType.category.name,
                    totalBalance = groupedAccounts.fold(BigDecimal.ZERO) { sum, acc ->
                        // Liabilities reduce net worth — negate for display
                        if (acc.accountType.category == AccountCategory.LIABILITY) {
                            sum - acc.currentBalance
                        } else {
                            sum + acc.currentBalance
                        }
                    },
                    accounts = groupedAccounts.map { AccountResponse.from(it) },
                )
            }
            .sortedWith(
                compareBy(
                    // Assets before liabilities in breakdown
                    { if (it.category == AccountCategory.ASSET.name) 0 else 1 },
                    { it.assetClass }
                )
            )

        return NetWorthResponse(
            totalAssets = totalAssets,
            totalLiabilities = totalLiabilities,
            netWorth = netWorth,
            breakdown = breakdown,
        )
    }

    // -------------------------
    // Accounts — Commands
    // -------------------------

    @Transactional
    override fun createAccount(userId: String, request: AccountRequest): AccountResponse {
        val user = findUser(userId)

        // Prevent duplicate account names per user
        if (accountRepository.existsByUserIdAndNameIgnoreCaseAndIsActiveTrue(userId, request.name)) {
            throw AppException.Conflict("An active account named '${request.name}' already exists")
        }

        val accountType = accountTypeRepository.findById(request.accountTypeId)
            .orElseThrow { AppException.NotFound("Account type '${request.accountTypeId}' not found") }

        val currency = accountRepository.findCurrencyByCode(request.currencyCode)
            ?: throw AppException.NotFound("Currency '${request.currencyCode}' not found")

        val account = Account(
            user = user,
            accountType = accountType,
            name = request.name.trim(),
            institution = request.institution?.trim(),
            accountNumber = request.accountNumber?.trim(),
            currency = currency,
            currentBalance = request.openingBalance,
            manualValuation = request.manualValuation,
            lastValuationDate = request.lastValuationDate,
            includeInNetWorth = request.includeInNetWorth,
            notes = request.notes?.trim(),
        )

        return AccountResponse.from(accountRepository.save(account))
    }

    @Transactional
    override fun updateAccount(
        userId: String,
        accountId: String,
        request: AccountUpdateRequest,
    ): AccountResponse {
        val account = findOwnedAccount(userId, accountId)

        // Name collision check — exclude current account from check
        if (request.name != null &&
            request.name.trim().lowercase() != account.name.lowercase() &&
            accountRepository.existsByUserIdAndNameIgnoreCaseAndIsActiveTrueAndIdNot(
                userId, request.name, accountId
            )
        ) {
            throw AppException.Conflict("An active account named '${request.name}' already exists")
        }

        // Apply only provided fields — PATCH semantics
        request.name?.let { account.name = it.trim() }
        request.institution?.let { account.institution = it.trim() }
        request.accountNumber?.let { account.accountNumber = it.trim() }
        request.includeInNetWorth?.let { account.includeInNetWorth = it }
        request.notes?.let { account.notes = it.trim() }
        request.lastValuationDate?.let { account.lastValuationDate = it }

        // Manual balance update — only allowed on manual_valuation accounts
        if (request.manualBalance != null) {
            if (!account.manualValuation) {
                throw AppException.BadRequest(
                    "Cannot manually set balance on '${account.name}' — " +
                            "account is not marked as manual valuation"
                )
            }
            account.currentBalance = request.manualBalance
            request.lastValuationDate?.let { account.lastValuationDate = it }
        }

        // @PreUpdate in BaseEntity handles updatedAt automatically
        return AccountResponse.from(accountRepository.save(account))
    }

    @Transactional
    override fun deactivateAccount(userId: String, accountId: String) {
        val account = findOwnedAccount(userId, accountId)

        if (!account.isActive) {
            throw AppException.BadRequest("Account '${account.name}' is already inactive")
        }

        account.isActive = false
        accountRepository.save(account)
    }

    @Transactional
    override fun reactivateAccount(userId: String, accountId: String): AccountResponse {
        val account = findOwnedAccount(userId, accountId)

        if (account.isActive) {
            throw AppException.BadRequest("Account '${account.name}' is already active")
        }

        account.isActive = true
        return AccountResponse.from(accountRepository.save(account))
    }

    // -------------------------
    // Internal helpers
    // -------------------------

    // Reusable BOLA-safe account fetch — used by AccountService and TransactionService
    override fun findOwnedAccount(userId: String, accountId: String): Account =
        accountRepository.findByIdAndUserId(accountId, userId)
            ?: throw AppException.Forbidden("Account not found or access denied")

    private fun findUser(userId: String): User =
        userRepository.findById(userId)
            .orElseThrow { AppException.NotFound("User not found") }
}