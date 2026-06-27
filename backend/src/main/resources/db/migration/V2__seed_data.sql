USE finance_tracker;

-- =====================================================
-- CURRENCIES
-- =====================================================

INSERT INTO currencies (code, name, symbol) VALUES
                                                ('SGD','Singapore Dollar','$'),
                                                ('USD','US Dollar','$'),
                                                ('MYR','Malaysian Ringgit','RM'),
                                                ('EUR','Euro','€'),
                                                ('GBP','British Pound','£'),
                                                ('JPY','Japanese Yen','¥'),
                                                ('AUD','Australian Dollar','$'),
                                                ('HKD','Hong Kong Dollar','$'),
                                                ('CNY','Chinese Yuan','¥');

-- =====================================================
-- ACCOUNT TYPES
-- =====================================================

INSERT INTO account_types
(name, category, asset_class)
VALUES

    ('Bank','ASSET','BANK'),

    ('Cash Wallet','ASSET','CASH'),

    ('Brokerage','ASSET','BROKERAGE'),

    ('CPF OA','ASSET','CPF'),
    ('CPF SA','ASSET','CPF'),
    ('CPF MA','ASSET','CPF'),
    ('CPF RA','ASSET','CPF'),

    ('Property','ASSET','PROPERTY'),

    ('Insurance','ASSET','INSURANCE'),

    ('Crypto Wallet','ASSET','CRYPTO'),

    ('Gold','ASSET','GOLD'),

    ('Credit Card','LIABILITY','CREDIT_CARD'),

    ('Mortgage','LIABILITY','LOAN'),

    ('Personal Loan','LIABILITY','LOAN'),

    ('Employer','EXTERNAL','EMPLOYER'),

    ('External World','EXTERNAL','EXTERNAL');

-- =====================================================
-- TRANSACTION TYPES
-- =====================================================

INSERT INTO transaction_types
(name, flow)
VALUES

    ('Salary','INFLOW'),

    ('Bonus','INFLOW'),

    ('Dividend','INFLOW'),

    ('Interest','INFLOW'),

    ('Gift Received','INFLOW'),

    ('Rental Income','INFLOW'),

    ('Refund','INFLOW'),

    ('Need','OUTFLOW'),

    ('Want','OUTFLOW'),

    ('Savings','OUTFLOW'),

    ('Investment','OUTFLOW'),

    ('Insurance Premium','OUTFLOW'),

    ('Loan Payment','OUTFLOW'),

    ('Tax','OUTFLOW'),

    ('Transfer','TRANSFER');

-- =====================================================
-- PARENT CATEGORIES
-- =====================================================

INSERT INTO categories
(user_id,parent_id,name)
VALUES

    (NULL,NULL,'Income'),
    (NULL,NULL,'Food & Drinks'),
    (NULL,NULL,'Transport'),
    (NULL,NULL,'Shopping'),
    (NULL,NULL,'Bills'),
    (NULL,NULL,'Housing'),
    (NULL,NULL,'Healthcare'),
    (NULL,NULL,'Entertainment'),
    (NULL,NULL,'Travel'),
    (NULL,NULL,'Education'),
    (NULL,NULL,'Insurance'),
    (NULL,NULL,'Investment'),
    (NULL,NULL,'Savings'),
    (NULL,NULL,'Family'),
    (NULL,NULL,'Taxes'),
    (NULL,NULL,'Transfer'),
    (NULL,NULL,'Others');

-- =====================================================
-- INCOME
-- =====================================================

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Salary'
FROM categories
WHERE name='Income';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Bonus'
FROM categories
WHERE name='Income';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Dividend'
FROM categories
WHERE name='Income';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Interest'
FROM categories
WHERE name='Income';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Rental Income'
FROM categories
WHERE name='Income';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Gift'
FROM categories
WHERE name='Income';

-- =====================================================
-- FOOD
-- =====================================================

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Coffee'
FROM categories
WHERE name='Food & Drinks';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Restaurant'
FROM categories
WHERE name='Food & Drinks';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Fast Food'
FROM categories
WHERE name='Food & Drinks';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Groceries'
FROM categories
WHERE name='Food & Drinks';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Bubble Tea'
FROM categories
WHERE name='Food & Drinks';

-- =====================================================
-- TRANSPORT
-- =====================================================

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Bus'
FROM categories
WHERE name='Transport';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'MRT'
FROM categories
WHERE name='Transport';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Taxi'
FROM categories
WHERE name='Transport';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Grab'
FROM categories
WHERE name='Transport';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Petrol'
FROM categories
WHERE name='Transport';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Parking'
FROM categories
WHERE name='Transport';

-- =====================================================
-- SHOPPING
-- =====================================================

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Clothing'
FROM categories
WHERE name='Shopping';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Electronics'
FROM categories
WHERE name='Shopping';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Household'
FROM categories
WHERE name='Shopping';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Online Shopping'
FROM categories
WHERE name='Shopping';

-- =====================================================
-- BILLS
-- =====================================================

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Electricity'
FROM categories
WHERE name='Bills';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Water'
FROM categories
WHERE name='Bills';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Internet'
FROM categories
WHERE name='Bills';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Mobile'
FROM categories
WHERE name='Bills';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Subscriptions'
FROM categories
WHERE name='Bills';

-- =====================================================
-- INVESTMENT
-- =====================================================

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Stocks'
FROM categories
WHERE name='Investment';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'ETF'
FROM categories
WHERE name='Investment';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Crypto'
FROM categories
WHERE name='Investment';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Gold'
FROM categories
WHERE name='Investment';

-- =====================================================
-- SAVINGS
-- =====================================================

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Emergency Fund'
FROM categories
WHERE name='Savings';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Vacation Fund'
FROM categories
WHERE name='Savings';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'General Savings'
FROM categories
WHERE name='Savings';

-- =====================================================
-- INSURANCE
-- =====================================================

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Life Insurance'
FROM categories
WHERE name='Insurance';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Health Insurance'
FROM categories
WHERE name='Insurance';

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Car Insurance'
FROM categories
WHERE name='Insurance';

-- =====================================================
-- TRANSFER
-- =====================================================

INSERT INTO categories(user_id,parent_id,name)
SELECT NULL,id,'Own Account Transfer'
FROM categories
WHERE name='Transfer';
