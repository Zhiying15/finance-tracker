package com.finance.constants

enum class TransactionStatus { PENDING_REVIEW, APPROVED, REJECTED, VOID }

enum class ImportReviewStatus { NEW, POSSIBLE_DUPLICATE, APPROVED, REJECTED }

enum class TransactionFlow { INFLOW, OUTFLOW, TRANSFER }

enum class RuleType { TEXT, REGEX, MERCHANT }

enum class CategoryType { ASSET, LIABILITY, EXTERNAL }

enum class AssetType { BANK, CASH, BROKERAGE, CPF, PROPERTY, INSURANCE, CRYPTO, GOLD, LOAN, CREDIT_CARD, EMPLOYER, EXTERNAL }