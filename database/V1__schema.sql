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
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
                               name VARCHAR(50) NOT NULL UNIQUE
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
                          currency_code VARCHAR(3),
                          is_active BOOLEAN DEFAULT TRUE,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                          FOREIGN KEY (user_id) REFERENCES users(id),
                          FOREIGN KEY (account_type_id) REFERENCES account_types(id),
                          FOREIGN KEY (currency_code) REFERENCES currencies(code)
);

-- =========================
-- TRANSACTION TYPES
-- =========================
CREATE TABLE transaction_types (
                                   id INT AUTO_INCREMENT PRIMARY KEY,
                                   name VARCHAR(50) NOT NULL,
                                   flow VARCHAR(20) NOT NULL
);

-- =========================
-- CATEGORIES
-- =========================
CREATE TABLE categories (
                            id INT AUTO_INCREMENT PRIMARY KEY,
                            user_id CHAR(36),
                            parent_id INT,
                            name VARCHAR(100) NOT NULL,

                            FOREIGN KEY (user_id) REFERENCES users(id),
                            FOREIGN KEY (parent_id) REFERENCES categories(id)
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

                           FOREIGN KEY (user_id) REFERENCES users(id),
                           FOREIGN KEY (default_category_id) REFERENCES categories(id)
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

                                FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- TRANSACTIONS (CORE LEDGER)
-- =========================
CREATE TABLE transactions (
                              id CHAR(36) PRIMARY KEY,
                              user_id CHAR(36),

                              from_account_id CHAR(36),
                              to_account_id CHAR(36),

                              transaction_type_id INT,
                              category_id INT,
                              merchant_id INT,

                              import_batch_id CHAR(36),

                              transaction_date DATE,
                              description TEXT,

                              amount DECIMAL(18,2),
                              currency_code VARCHAR(3),

                              is_manual BOOLEAN DEFAULT FALSE,
                              is_recurring BOOLEAN DEFAULT FALSE,

                              status VARCHAR(20) DEFAULT 'DRAFT',

                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                              FOREIGN KEY (user_id) REFERENCES users(id),
                              FOREIGN KEY (from_account_id) REFERENCES accounts(id),
                              FOREIGN KEY (to_account_id) REFERENCES accounts(id),
                              FOREIGN KEY (transaction_type_id) REFERENCES transaction_types(id),
                              FOREIGN KEY (category_id) REFERENCES categories(id),
                              FOREIGN KEY (merchant_id) REFERENCES merchants(id),
                              FOREIGN KEY (import_batch_id) REFERENCES import_batches(id),
                              FOREIGN KEY (currency_code) REFERENCES currencies(code)
);

-- =========================
-- IMPORT TRANSACTIONS (DRAFT)
-- =========================
CREATE TABLE import_transactions (
                                     id CHAR(36) PRIMARY KEY,
                                     batch_id CHAR(36),
                                     json_data JSON,
                                     approved BOOLEAN DEFAULT FALSE,

                                     FOREIGN KEY (batch_id) REFERENCES import_batches(id)
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

                         FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =========================
-- ASSET TYPES
-- =========================
CREATE TABLE asset_types (
                             id INT AUTO_INCREMENT PRIMARY KEY,
                             name VARCHAR(50) NOT NULL
);

-- =========================
-- ASSETS
-- =========================
CREATE TABLE assets (
                        id CHAR(36) PRIMARY KEY,
                        user_id CHAR(36),
                        asset_type_id INT,
                        account_id CHAR(36),

                        name VARCHAR(100),
                        provider VARCHAR(100),
                        current_value DECIMAL(18,2),

                        metadata JSON,

                        FOREIGN KEY (user_id) REFERENCES users(id),
                        FOREIGN KEY (asset_type_id) REFERENCES asset_types(id),
                        FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- =========================
-- RULES
-- =========================
CREATE TABLE rules (
                       id CHAR(36) PRIMARY KEY,
                       user_id CHAR(36),
                       contains_text VARCHAR(100),
                       merchant_id INT,
                       category_id INT,

                       FOREIGN KEY (user_id) REFERENCES users(id),
                       FOREIGN KEY (merchant_id) REFERENCES merchants(id),
                       FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- =========================
-- RECURRING
-- =========================
CREATE TABLE recurring_transactions (
                                        id CHAR(36) PRIMARY KEY,
                                        user_id CHAR(36),
                                        merchant_id INT,
                                        category_id INT,

                                        amount DECIMAL(18,2),
                                        frequency VARCHAR(20),

                                        FOREIGN KEY (user_id) REFERENCES users(id),
                                        FOREIGN KEY (merchant_id) REFERENCES merchants(id),
                                        FOREIGN KEY (category_id) REFERENCES categories(id)
);