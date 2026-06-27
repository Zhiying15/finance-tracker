DROP DATABASE IF EXISTS finance_tracker;
CREATE DATABASE finance_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finance_tracker;

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
                       id CHAR(36) PRIMARY KEY,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(100),

                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================
-- CURRENCIES
-- =========================
CREATE TABLE currencies (
                            code VARCHAR(3) PRIMARY KEY,
                            name VARCHAR(50) NOT NULL,
                            symbol VARCHAR(10)
);

-- =========================
-- ACCOUNT TYPES
-- =========================
CREATE TABLE account_types (
                               id INT AUTO_INCREMENT PRIMARY KEY,
                               name VARCHAR(50) NOT NULL UNIQUE,
                               category ENUM('ASSET','LIABILITY','EXTERNAL') NOT NULL,
                               asset_class ENUM('BANK','CASH','BROKERAGE','CPF','PROPERTY','INSURANCE','CRYPTO','GOLD','LOAN','CREDIT_CARD','EMPLOYER','EXTERNAL') NOT NULL
);

-- =========================
-- ACCOUNTS
-- =========================
CREATE TABLE accounts (
                          id CHAR(36) PRIMARY KEY,
                          user_id CHAR(36) NOT NULL,
                          account_type_id INT NOT NULL,

                          name VARCHAR(100) NOT NULL,
                          institution VARCHAR(100),
                          account_number VARCHAR(100),
                          currency_code VARCHAR(3) NOT NULL,
                          current_balance DECIMAL(18,2) NOT NULL DEFAULT 0,
                          manual_valuation BOOLEAN DEFAULT FALSE,
                          last_valuation_date DATE,
                          include_in_net_worth BOOLEAN DEFAULT TRUE,
                          notes TEXT,

                          is_active BOOLEAN DEFAULT TRUE,

                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,
                          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                          FOREIGN KEY (account_type_id) REFERENCES account_types(id),
                          FOREIGN KEY (currency_code) REFERENCES currencies(code),

                          INDEX idx_accounts_user (user_id),
                          INDEX idx_accounts_type(account_type_id)
);

-- =========================
-- TRANSACTION TYPES
-- =========================
CREATE TABLE transaction_types (
                                   id INT AUTO_INCREMENT PRIMARY KEY,
                                   name VARCHAR(50) NOT NULL UNIQUE,
                                   flow ENUM('INFLOW','OUTFLOW','TRANSFER') NOT NULL
);

-- =========================
-- CATEGORIES
-- =========================
CREATE TABLE categories (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            user_id CHAR(36),
                            parent_id INT,
                            name VARCHAR(100) NOT NULL,

                            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                            FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,

                            INDEX idx_categories_user (user_id)
);

-- =========================
-- MERCHANTS
-- =========================
CREATE TABLE merchants (
                           id INT AUTO_INCREMENT PRIMARY KEY,
                           user_id CHAR(36),

                           merchant_name VARCHAR(200),
                           normalized_name VARCHAR(200),

                           default_category_id INT,

                           FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                           FOREIGN KEY (default_category_id) REFERENCES categories(id) ON DELETE SET NULL,

                           UNIQUE KEY uq_user_merchant (user_id, merchant_name),
                           INDEX idx_merchants_user (user_id)
);

-- =========================
-- IMPORT BATCHES
-- =========================
CREATE TABLE import_batches (
                                id CHAR(36) PRIMARY KEY,
                                user_id CHAR(36),

                                filename VARCHAR(255),
                                status VARCHAR(50),

                                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

                                INDEX idx_import_batches_user (user_id)
);

-- =========================
-- TRANSACTIONS (CORE LEDGER)
-- =========================
CREATE TABLE transactions (
                              id CHAR(36) PRIMARY KEY,
                              user_id CHAR(36) NOT NULL,

                              from_account_id CHAR(36),
                              to_account_id CHAR(36),

                              transaction_type_id INT,
                              category_id INT,
                              merchant_id INT,
                              import_batch_id CHAR(36),

                              transaction_date DATE NOT NULL,

                              description TEXT,

                              reference_number VARCHAR(100),

                              amount DECIMAL(18,2) NOT NULL,
                              currency_code VARCHAR(3) NOT NULL,
                              exchange_rate DECIMAL(18,8) DEFAULT 1,
                              remarks TEXT,

                              is_manual BOOLEAN DEFAULT FALSE,
                              is_recurring BOOLEAN DEFAULT FALSE,

                              status ENUM('PENDING_REVIEW','APPROVED','REJECTED','VOID') DEFAULT 'PENDING_REVIEW',

                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                                  ON UPDATE CURRENT_TIMESTAMP,

                              FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                              FOREIGN KEY (from_account_id) REFERENCES accounts(id),
                              FOREIGN KEY (to_account_id) REFERENCES accounts(id),
                              FOREIGN KEY (transaction_type_id) REFERENCES transaction_types(id),
                              FOREIGN KEY (category_id) REFERENCES categories(id),
                              FOREIGN KEY (merchant_id) REFERENCES merchants(id),
                              FOREIGN KEY (import_batch_id) REFERENCES import_batches(id),
                              FOREIGN KEY (currency_code) REFERENCES currencies(code),

                              INDEX idx_tx_user_date(user_id, transaction_date),
                              INDEX idx_tx_from(from_account_id),
                              INDEX idx_tx_to(to_account_id)
);

-- =========================
-- IMPORT TRANSACTIONS
-- =========================
CREATE TABLE import_transactions (
                                     id CHAR(36) PRIMARY KEY,
                                     batch_id CHAR(36) NOT NULL,

                                     json_data JSON,
--                                      duplicate_of_transaction_id CHAR(36),
                                     review_status ENUM('NEW','POSSIBLE_DUPLICATE','APPROVED','REJECTED') DEFAULT 'NEW',
                                     approved BOOLEAN DEFAULT FALSE,

                                     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                     FOREIGN KEY (batch_id) REFERENCES import_batches(id) ON DELETE CASCADE
--                                      FOREIGN KEY (duplicate_of_transaction_id) REFERENCES transactions(id)
);

-- =========================
-- BUDGETS
-- =========================
CREATE TABLE budgets (
                         id CHAR(36) PRIMARY KEY,
                         user_id CHAR(36),

                         year INT,
                         month INT,

                         need_percent DECIMAL(5,2),
                         want_percent DECIMAL(5,2),
                         savings_percent DECIMAL(5,2),

                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

                         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

                         UNIQUE KEY uq_budget_user_month (user_id, year, month)
);

-- =========================
-- RULES
-- =========================
CREATE TABLE rules (
                       id CHAR(36) PRIMARY KEY,
                       user_id CHAR(36) NOT NULL,

                       rule_type ENUM('TEXT','REGEX','MERCHANT') DEFAULT 'TEXT',
                       contains_text VARCHAR(100),

                       merchant_id INT,
                       category_id INT,

--                        transaction_type_id INT,
                       priority INT DEFAULT 100,

                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                       FOREIGN KEY (merchant_id) REFERENCES merchants(id),
                       FOREIGN KEY (category_id) REFERENCES categories(id),
--                        FOREIGN KEY (transaction_type_id) REFERENCES transaction_types(id),
                       INDEX idx_rules_user (user_id)
);

-- =========================
-- RECURRING TRANSACTIONS
-- =========================
CREATE TABLE recurring_transactions (
                                        id CHAR(36) PRIMARY KEY,
                                        user_id CHAR(36),

                                        merchant_id INT,
                                        category_id INT,

                                        amount DECIMAL(18,2),
                                        frequency VARCHAR(20),

                                        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                                        FOREIGN KEY (merchant_id) REFERENCES merchants(id),
                                        FOREIGN KEY (category_id) REFERENCES categories(id)
);