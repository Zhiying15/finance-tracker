package com.finance.constants

enum class TransactionStatus { PENDING_REVIEW, APPROVED, REJECTED, VOID }

enum class ImportReviewStatus { NEW, POSSIBLE_DUPLICATE, APPROVED, REJECTED }

enum class TransactionFlow { INFLOW, OUTFLOW, TRANSFER }

enum class RuleType { TEXT, REGEX, MERCHANT }

enum class AccountCategory { ASSET, LIABILITY, EXTERNAL }

enum class AssetClass { BANK, CASH, BROKERAGE, CPF, PROPERTY, INSURANCE, CRYPTO, GOLD, LOAN, CREDIT_CARD, EMPLOYER, EXTERNAL }

enum class ResponseCode { SUCCESS, FAILURE, UNAUTHENTICATED, EXPIRED }

enum class BudgetType { NEED, WANT, SAVINGS, INCOME, EXCLUDED }

enum class ReviewStatus { NEW, POSSIBLE_DUPLICATE, APPROVED, REJECTED }