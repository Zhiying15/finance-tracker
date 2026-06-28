package com.finance.utility

import com.finance.repository.AccountRepository
import com.finance.repository.TransactionRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class ReconciliationScheduler(
    private val accountRepository: AccountRepository,
    private val transactionRepository: TransactionRepository,
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @Scheduled(cron = "0 30 0 * * *") // 00:30 daily — after exchange rate fetch at 00:00
    @Transactional
    fun reconcileAccountBalances() {
        log.info("Starting nightly account balance reconciliation")

        val accounts = accountRepository.findAll()

        accounts.forEach { account ->
            val inflow = transactionRepository.sumApprovedInflowForAccount(account.id)
            val outflow = transactionRepository.sumApprovedOutflowForAccount(account.id)
            val recomputedBalance = inflow - outflow

            if (recomputedBalance.compareTo(account.currentBalance) != 0) {
                log.warn(
                    "Balance drift detected for account ${account.id}: " +
                            "stored=${account.currentBalance}, recomputed=$recomputedBalance. Patching."
                )
                accountRepository.save(account.copy(currentBalance = recomputedBalance))
            }
        }

        log.info("Reconciliation complete for ${accounts.size} accounts")
    }
}