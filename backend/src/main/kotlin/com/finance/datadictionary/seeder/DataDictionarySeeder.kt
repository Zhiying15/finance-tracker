package com.financedatadictionary.seeder

import datadictionary.repository.DataDictionaryRepository
import entity.DataDictionary
import org.slf4j.LoggerFactory
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
@Order(1) // Runs before exchange rate fetch at Order(2)
class DataDictionarySeeder(
    private val repository: DataDictionaryRepository,
) : ApplicationRunner {

    private val log = LoggerFactory.getLogger(javaClass)

    private data class Entry(
        val group: String,
        val code: String,
        val label: String,
        val description: String? = null,
        val order: Int = 0,
        val active: Boolean = true,
    )

    private val entries = listOf(

        // --- TRANSACTION_FLOW ---
        Entry("TRANSACTION_FLOW", "INFLOW",
            "Inflow",   "Money coming in — salary, returns, transfers received", 1),
        Entry("TRANSACTION_FLOW", "OUTFLOW",
            "Outflow",  "Money going out — expenses, payments",                  2),
        Entry("TRANSACTION_FLOW", "TRANSFER",
            "Transfer", "Movement between your own accounts",                    3),

        // --- BUDGET_TYPE ---
        Entry("BUDGET_TYPE", "NEED",
            "Need",     "Essential expenses — housing, food, transport, utilities",         1),
        Entry("BUDGET_TYPE", "WANT",
            "Want",     "Non-essential spending — dining out, entertainment, shopping",     2),
        Entry("BUDGET_TYPE", "SAVINGS",
            "Savings",  "Money set aside — investments, CPF top-ups, emergency fund",      3),
        Entry("BUDGET_TYPE", "INCOME",
            "Income",   "Money received — salary, freelance, investment returns",          4),
        Entry("BUDGET_TYPE", "EXCLUDED",
            "Excluded", "Excluded from budget — internal transfers, credit card payments", 5,
            active = false), // Hidden from user-facing dropdowns

        // --- IMPORT_REVIEW_STATUS ---
        Entry("IMPORT_REVIEW_STATUS", "NEW",
            "New",                "Freshly parsed — awaiting your review",                1),
        Entry("IMPORT_REVIEW_STATUS", "POSSIBLE_DUPLICATE",
            "Possible Duplicate", "Matches an existing transaction — please confirm",     2),
        Entry("IMPORT_REVIEW_STATUS", "APPROVED",
            "Approved",           "Promoted to the main transaction ledger",              3),
        Entry("IMPORT_REVIEW_STATUS", "REJECTED",
            "Rejected",           "Dismissed — will not be added to the ledger",         4),

        // --- ACCOUNT_CATEGORY ---
        Entry("ACCOUNT_CATEGORY", "ASSET",
            "Asset",     "Accounts you own — contribute positively to net worth", 1),
        Entry("ACCOUNT_CATEGORY", "LIABILITY",
            "Liability", "Money you owe — reduces net worth",                     2),
        Entry("ACCOUNT_CATEGORY", "EXTERNAL",
            "External",  "Counterparty accounts — employers, external parties",   3),

        // --- ASSET_CLASS ---
        Entry("ASSET_CLASS", "BANK",
            "Bank Account",          "Standard savings or current bank account",          1),
        Entry("ASSET_CLASS", "CASH",
            "Cash",                  "Physical cash on hand",                             2),
        Entry("ASSET_CLASS", "BROKERAGE",
            "Brokerage/Investments", "Stocks, ETFs, unit trusts in a brokerage account", 3),
        Entry("ASSET_CLASS", "CPF",
            "CPF",                   "Singapore Central Provident Fund",                 4),
        Entry("ASSET_CLASS", "PROPERTY",
            "Property",              "Real estate — manually valued",                    5),
        Entry("ASSET_CLASS", "INSURANCE",
            "Insurance",             "Life or investment-linked policy with cash value",  6),
        Entry("ASSET_CLASS", "CRYPTO",
            "Cryptocurrency",        "Digital asset holdings",                           7),
        Entry("ASSET_CLASS", "GOLD",
            "Gold",                  "Physical or paper gold holdings",                  8),
        Entry("ASSET_CLASS", "LOAN",
            "Loan",                  "Personal, car, or home loan liability",            9),
        Entry("ASSET_CLASS", "CREDIT_CARD",
            "Credit Card",           "Credit card outstanding balance",                  10),
        Entry("ASSET_CLASS", "EMPLOYER",
            "Employer",              "Your employer — source of salary inflows",         11),
        Entry("ASSET_CLASS", "EXTERNAL",
            "External Party",        "Any other external counterparty",                  12),

        // --- IMPORTED_FILE_STATUS ---
        Entry("IMPORTED_FILE_STATUS", "PROCESSING",
            "Processing",     "File uploaded — Ollama extraction in progress",           1),
        Entry("IMPORTED_FILE_STATUS", "PENDING_REVIEW",
            "Pending Review", "Extraction complete — rows awaiting your review",         2),
        Entry("IMPORTED_FILE_STATUS", "COMPLETED",
            "Completed",      "All rows reviewed and actioned",                         3),
        Entry("IMPORTED_FILE_STATUS", "FAILED",
            "Failed",         "Extraction failed — check parse errors",                 4),
    )

    @Transactional
    override fun run(args: ApplicationArguments) {
        var seeded  = 0
        var skipped = 0

        entries.forEach { entry ->
            if (!repository.existsByGroupNameAndCode(entry.group, entry.code)) {
                repository.save(
                    DataDictionary(
                        groupName = entry.group,
                        code = entry.code,
                        label = entry.label,
                        description = entry.description,
                        displayOrder = entry.order,
                        isActive = entry.active,
                    )
                )
                seeded++
            } else {
                skipped++
            }
        }

        log.info("DataDictionary seeder — seeded=$seeded skipped=$skipped")
    }
}