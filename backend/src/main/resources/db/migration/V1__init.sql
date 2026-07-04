-- =========================
-- DATABASE
-- =========================
CREATE DATABASE IF NOT EXISTS finance_tracker
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE finance_tracker;

-- =========================
-- CURRENCIES
-- Lookup table — no timestamps
-- Referenced by accounts, transactions, exchange_rates
-- =========================
CREATE TABLE IF NOT EXISTS currencies (
                                          code   VARCHAR(3)  NOT NULL,
    name   VARCHAR(50) NOT NULL,
    symbol VARCHAR(10),

    PRIMARY KEY (code)
    );

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS users (
                                     id            CHAR(36)     NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(100),
    created_at    DATETIME(6)  NOT NULL,
    updated_at    DATETIME(6)  NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
    );

-- =========================
-- ACCOUNT TYPES
-- Lookup table — no timestamps
-- category  : AccountCategory enum (ASSET | LIABILITY | EXTERNAL)
-- asset_class: AssetClass enum     (BANK | CASH | BROKERAGE | ...)
-- =========================
CREATE TABLE IF NOT EXISTS account_types (
                                             id          INT          NOT NULL AUTO_INCREMENT,
                                             name        VARCHAR(50)  NOT NULL,
    category    VARCHAR(20)  NOT NULL,
    asset_class VARCHAR(20)  NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_account_types_name (name)
    );

-- =========================
-- ACCOUNTS
-- =========================
CREATE TABLE IF NOT EXISTS accounts (
                                        id                   CHAR(36)      NOT NULL,
    user_id              CHAR(36)      NOT NULL,
    account_type_id      INT           NOT NULL,
    name                 VARCHAR(100)  NOT NULL,
    institution          VARCHAR(100),
    account_number       VARCHAR(100),
    currency_code        VARCHAR(3)    NOT NULL,
    current_balance      DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    manual_valuation     TINYINT(1)    NOT NULL DEFAULT 0,
    last_valuation_date  DATE,
    include_in_net_worth TINYINT(1)    NOT NULL DEFAULT 1,
    notes                TEXT,
    is_active            TINYINT(1)    NOT NULL DEFAULT 1,
    created_at           DATETIME(6)   NOT NULL,
    updated_at           DATETIME(6)   NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_accounts_user
    FOREIGN KEY (user_id)         REFERENCES users(id)         ON DELETE CASCADE,
    CONSTRAINT fk_accounts_type
    FOREIGN KEY (account_type_id) REFERENCES account_types(id),
    CONSTRAINT fk_accounts_currency
    FOREIGN KEY (currency_code)   REFERENCES currencies(code),

    INDEX idx_accounts_user        (user_id),
    INDEX idx_accounts_type        (account_type_id),
    INDEX idx_accounts_user_active (user_id, is_active)
    );

-- =========================
-- BUDGETS
-- One row per user per year+month
-- =========================
CREATE TABLE IF NOT EXISTS budgets (
                                       id              CHAR(36)      NOT NULL,
    user_id         CHAR(36)      NOT NULL,
    year            INT           NOT NULL,
    month           INT           NOT NULL,
    need_percent    DECIMAL(5,2),
    want_percent    DECIMAL(5,2),
    savings_percent DECIMAL(5,2),
    declared_income DECIMAL(18,2),
    created_at      DATETIME(6)   NOT NULL,
    updated_at      DATETIME(6)   NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_budgets_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    UNIQUE KEY uq_budget_user_month (user_id, year, month)
    );

-- =========================
-- IMPORTED FILES
-- One row per uploaded file — tracks parsing lifecycle
-- status: PROCESSING | PENDING_REVIEW | COMPLETED | FAILED
-- =========================
CREATE TABLE IF NOT EXISTS imported_file (
                                             id         CHAR(36)     NOT NULL,
    user_id    CHAR(36)     NOT NULL,
    filename   VARCHAR(255),
    account_id CHAR(36) NOT NULL,
    status     VARCHAR(50)  NOT NULL DEFAULT 'PROCESSING',
    created_at DATETIME(6)  NOT NULL,
    updated_at DATETIME(6)  NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_imported_file_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_imported_file_account
    FOREIGN KEY (account_id) REFERENCES accounts(id),

    INDEX idx_imported_file_user (user_id)
    );

-- =========================
-- IMPORTED TRANSACTIONS
-- Staging rows extracted by Ollama from uploaded file
-- review_status: NEW | POSSIBLE_DUPLICATE | APPROVED | REJECTED
-- approved: false until user approves → promoted to transactions
-- =========================
CREATE TABLE IF NOT EXISTS imported_transactions (
                                                     id            CHAR(36)    NOT NULL,
    file_id       CHAR(36)    NOT NULL,
    json_data     JSON,
    parse_error   VARCHAR(500),
    review_status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    approved      TINYINT(1)  NOT NULL DEFAULT 0,
    created_at    DATETIME(6) NOT NULL,
    updated_at    DATETIME(6) NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_imported_tx_file
    FOREIGN KEY (file_id) REFERENCES imported_file(id) ON DELETE CASCADE,

    INDEX idx_imported_tx_file          (file_id),
    INDEX idx_imported_tx_review_status (file_id, review_status)
    );

-- =========================
-- TRANSACTIONS (CORE LEDGER)
-- Written once approved — no further status layer needed
-- transaction_flow : TransactionFlow enum (INFLOW | OUTFLOW | TRANSFER)
-- budget_type      : BudgetType enum      (NEED | WANT | SAVINGS | INCOME | EXCLUDED)
-- from_account_id  : source account (set for OUTFLOW and TRANSFER)
-- to_account_id    : destination account  (set for INFLOW and TRANSFER)
-- imported_transaction_id: traceability back to staging row, null for manual entries
-- =========================
CREATE TABLE IF NOT EXISTS transactions (
                                            id                      CHAR(36)      NOT NULL,
    user_id                 CHAR(36)      NOT NULL,
    from_account_id         CHAR(36),
    to_account_id           CHAR(36),
    transaction_flow        VARCHAR(20),
    imported_transaction_id CHAR(36),
    transaction_date        DATE          NOT NULL,
    description             TEXT,
    amount                  DECIMAL(18,2) NOT NULL,
    currency_code           VARCHAR(3)    NOT NULL,
    exchange_rate           DECIMAL(18,8) NOT NULL DEFAULT 1.00000000,
    remarks                 TEXT,
    is_manual               TINYINT(1)    NOT NULL DEFAULT 0,
    is_recurring            TINYINT(1)    NOT NULL DEFAULT 0,
    budget_type             VARCHAR(20),
    created_at              DATETIME(6)   NOT NULL,
    updated_at              DATETIME(6)   NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_tx_user
    FOREIGN KEY (user_id)                 REFERENCES users(id)                ON DELETE CASCADE,
    CONSTRAINT fk_tx_from_account
    FOREIGN KEY (from_account_id)         REFERENCES accounts(id),
    CONSTRAINT fk_tx_to_account
    FOREIGN KEY (to_account_id)           REFERENCES accounts(id),
    CONSTRAINT fk_tx_imported
    FOREIGN KEY (imported_transaction_id) REFERENCES imported_transactions(id),
    CONSTRAINT fk_tx_currency
    FOREIGN KEY (currency_code)           REFERENCES currencies(code),

    INDEX idx_tx_user_date   (user_id, transaction_date),
    INDEX idx_tx_from        (from_account_id),
    INDEX idx_tx_to          (to_account_id),
    INDEX idx_tx_budget_type (user_id, budget_type, transaction_date)
    );

-- =========================
-- EXCHANGE RATES
-- Base currency: SGD (configured in application.yml)
-- One row per base+target+date — unique constraint prevents duplicates on nightly fetch
-- =========================
CREATE TABLE IF NOT EXISTS exchange_rates (
                                              id              INT           NOT NULL AUTO_INCREMENT,
                                              base_currency   VARCHAR(3)    NOT NULL,
    target_currency VARCHAR(3)    NOT NULL,
    rate            DECIMAL(18,8) NOT NULL,
    rate_date       DATE          NOT NULL,

    PRIMARY KEY (id),

    CONSTRAINT fk_er_base
    FOREIGN KEY (base_currency)   REFERENCES currencies(code),
    CONSTRAINT fk_er_target
    FOREIGN KEY (target_currency) REFERENCES currencies(code),

    UNIQUE KEY uq_rate_base_target_date (base_currency, target_currency, rate_date),
    INDEX idx_rate_lookup               (base_currency, target_currency, rate_date)
    );

-- =========================
-- DATA DICTIONARY
-- Lookup table — no timestamps
-- Seeded at startup by DataDictionarySeeder
-- Powers all UI dropdowns
-- =========================
CREATE TABLE IF NOT EXISTS data_dictionary (
                                               id            INT          NOT NULL AUTO_INCREMENT,
                                               group_name    VARCHAR(100) NOT NULL,
    code          VARCHAR(100) NOT NULL,
    label         VARCHAR(150) NOT NULL,
    description   VARCHAR(255),
    display_order INT          NOT NULL DEFAULT 0,
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,

    PRIMARY KEY (id),

    UNIQUE KEY uq_dict_group_code (group_name, code),
    INDEX idx_dict_group          (group_name)
    );

-- =========================
-- SEED DATA
-- =========================

INSERT INTO currencies (code, name, symbol) VALUES
                                                ('SGD', 'Singapore Dollar',   'S$'),
                                                ('USD', 'US Dollar',          '$'),
                                                ('EUR', 'Euro',               '€'),
                                                ('GBP', 'British Pound',      '£'),
                                                ('JPY', 'Japanese Yen',       '¥'),
                                                ('MYR', 'Malaysian Ringgit',  'RM'),
                                                ('AUD', 'Australian Dollar',  'A$'),
                                                ('HKD', 'Hong Kong Dollar',   'HK$'),
                                                ('CNY', 'Chinese Yuan',       '¥'),
                                                ('THB', 'Thai Baht',          '฿'),
                                                ('IDR', 'Indonesian Rupiah',  'Rp'),
                                                ('PHP', 'Philippine Peso',    '₱'),
                                                ('VND', 'Vietnamese Dong',    '₫'),
                                                ('KRW', 'South Korean Won',   '₩'),
                                                ('INR', 'Indian Rupee',       '₹');

INSERT INTO account_types (name, category, asset_class) VALUES
                                                            ('Bank Account',   'ASSET',    'BANK'),
                                                            ('Cash',           'ASSET',    'CASH'),
                                                            ('Brokerage',      'ASSET',    'BROKERAGE'),
                                                            ('CPF',            'ASSET',    'CPF'),
                                                            ('Property',       'ASSET',    'PROPERTY'),
                                                            ('Insurance',      'ASSET',    'INSURANCE'),
                                                            ('Crypto Wallet',  'ASSET',    'CRYPTO'),
                                                            ('Gold',           'ASSET',    'GOLD'),
                                                            ('Personal Loan',  'LIABILITY','LOAN'),
                                                            ('Credit Card',    'LIABILITY','CREDIT_CARD'),
                                                            ('Employer',       'EXTERNAL', 'EMPLOYER'),
                                                            ('External Party', 'EXTERNAL', 'EXTERNAL');

INSERT INTO data_dictionary (group_name, code, label, description, display_order, is_active) VALUES

-- TRANSACTION_FLOW
('TRANSACTION_FLOW', 'INFLOW',   'Inflow',   'Money coming in — salary, returns, transfers received', 1, 1),
('TRANSACTION_FLOW', 'OUTFLOW',  'Outflow',  'Money going out — expenses, payments',                  2, 1),
('TRANSACTION_FLOW', 'TRANSFER', 'Transfer', 'Movement between your own accounts',                    3, 1),

-- BUDGET_TYPE
('BUDGET_TYPE', 'NEED',     'Need',     'Essential expenses — housing, food, transport, utilities',              1, 1),
('BUDGET_TYPE', 'WANT',     'Want',     'Non-essential spending — dining out, entertainment, shopping',          2, 1),
('BUDGET_TYPE', 'SAVINGS',  'Savings',  'Money set aside — investments, CPF top-ups, emergency fund',           3, 1),
('BUDGET_TYPE', 'INCOME',   'Income',   'Money received — salary, freelance, investment returns',               4, 1),
('BUDGET_TYPE', 'EXCLUDED', 'Excluded', 'Excluded from budget — internal transfers, credit card payments',      5, 0),

-- IMPORT_REVIEW_STATUS
('IMPORT_REVIEW_STATUS', 'NEW',                'New',                'Freshly parsed, awaiting your review',               1, 1),
('IMPORT_REVIEW_STATUS', 'POSSIBLE_DUPLICATE', 'Possible Duplicate', 'Matches an existing transaction — please confirm',   2, 1),
('IMPORT_REVIEW_STATUS', 'APPROVED',           'Approved',           'Promoted to the main transaction ledger',            3, 1),
('IMPORT_REVIEW_STATUS', 'REJECTED',           'Rejected',           'Dismissed — will not be added to the ledger',        4, 1),

-- ACCOUNT_CATEGORY
('ACCOUNT_CATEGORY', 'ASSET',     'Asset',     'Accounts you own — contribute positively to net worth', 1, 1),
('ACCOUNT_CATEGORY', 'LIABILITY', 'Liability', 'Money you owe — reduces net worth',                     2, 1),
('ACCOUNT_CATEGORY', 'EXTERNAL',  'External',  'Counterparty accounts — employers, external parties',   3, 1),

-- ASSET_CLASS
('ASSET_CLASS', 'BANK',        'Bank Account',          'Standard savings or current bank account',             1,  1),
('ASSET_CLASS', 'CASH',        'Cash',                  'Physical cash on hand',                               2,  1),
('ASSET_CLASS', 'BROKERAGE',   'Brokerage/Investments', 'Stocks, ETFs, unit trusts in a brokerage account',    3,  1),
('ASSET_CLASS', 'CPF',         'CPF',                   'Singapore Central Provident Fund',                    4,  1),
('ASSET_CLASS', 'PROPERTY',    'Property',              'Real estate — manually valued',                       5,  1),
('ASSET_CLASS', 'INSURANCE',   'Insurance',             'Life or investment-linked policy with cash value',     6,  1),
('ASSET_CLASS', 'CRYPTO',      'Cryptocurrency',        'Digital asset holdings',                              7,  1),
('ASSET_CLASS', 'GOLD',        'Gold',                  'Physical or paper gold holdings',                     8,  1),
('ASSET_CLASS', 'LOAN',        'Loan',                  'Personal, car, or home loan liability',               9,  1),
('ASSET_CLASS', 'CREDIT_CARD', 'Credit Card',           'Credit card outstanding balance',                     10, 1),
('ASSET_CLASS', 'EMPLOYER',    'Employer',              'Your employer — source of salary inflows',            11, 1),
('ASSET_CLASS', 'EXTERNAL',    'External Party',        'Any other external counterparty',                     12, 1),

-- IMPORTED_FILE_STATUS
('IMPORTED_FILE_STATUS', 'PROCESSING',    'Processing',    'File uploaded — Ollama extraction in progress', 1, 1),
('IMPORTED_FILE_STATUS', 'PENDING_REVIEW','Pending Review','Extraction complete — rows awaiting your review',2, 1),
('IMPORTED_FILE_STATUS', 'COMPLETED',     'Completed',     'All rows reviewed and actioned',                3, 1),
('IMPORTED_FILE_STATUS', 'FAILED',        'Failed',        'Extraction failed — check parse errors',        4, 1);