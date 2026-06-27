USE finance_tracker;

-- =========================
-- CURRENCIES
-- =========================
INSERT INTO currencies VALUES
                           ('SGD','Singapore Dollar','$'),
                           ('USD','US Dollar','$'),
                           ('MYR','Malaysian Ringgit','RM'),
                           ('EUR','Euro','€'),
                           ('JPY','Japanese Yen','¥'),
                           ('GBP','British Pound','£');

-- =========================
-- ACCOUNT TYPES
-- =========================
INSERT INTO account_types(name) VALUES
                                    ('Bank'),
                                    ('Credit Card'),
                                    ('Brokerage'),
                                    ('CPF OA'),
                                    ('CPF SA'),
                                    ('CPF MA'),
                                    ('CPF RA'),
                                    ('Insurance'),
                                    ('Property'),
                                    ('Crypto Wallet'),
                                    ('Gold'),
                                    ('Cash Wallet'),
                                    ('Employer'),
                                    ('External'),
                                    ('Merchant'),
                                    ('Loan');

-- =========================
-- TRANSACTION TYPES
-- =========================
INSERT INTO transaction_types(name, flow) VALUES
                                              ('Income','INFLOW'),
                                              ('Need','OUTFLOW'),
                                              ('Want','OUTFLOW'),
                                              ('Savings','OUTFLOW'),
                                              ('Investment','OUTFLOW'),
                                              ('Transfer','BOTH'),
                                              ('Refund','INFLOW'),
                                              ('Dividend','INFLOW'),
                                              ('Interest','INFLOW'),
                                              ('Property Purchase','OUTFLOW'),
                                              ('Insurance Premium','OUTFLOW'),
                                              ('CPF Contribution','INFLOW'),
                                              ('Loan Payment','OUTFLOW');

-- =========================
-- ASSET TYPES
-- =========================
INSERT INTO asset_types(name) VALUES
                                  ('Cash'),
                                  ('Property'),
                                  ('Insurance'),
                                  ('CPF'),
                                  ('Equity'),
                                  ('Crypto'),
                                  ('Gold');

-- =========================
-- CATEGORIES
-- =========================
INSERT INTO categories(name) VALUES
                                 ('Income'),
                                 ('Salary'),
                                 ('Bonus'),
                                 ('Interest'),
                                 ('Dividend'),

                                 ('Need'),
                                 ('Groceries'),
                                 ('Transport'),
                                 ('Utilities'),
                                 ('Insurance'),
                                 ('Healthcare'),
                                 ('CPF'),
                                 ('Mortgage'),

                                 ('Want'),
                                 ('Coffee'),
                                 ('Dining'),
                                 ('Shopping'),
                                 ('Entertainment'),
                                 ('Travel'),
                                 ('Subscription'),

                                 ('Savings'),
                                 ('Emergency Fund'),

                                 ('Investment'),
                                 ('Stocks'),
                                 ('ETF'),
                                 ('Crypto'),

                                 ('Others');

-- =========================
-- MERCHANTS
-- =========================
INSERT INTO merchants (merchant_name, normalized_name) VALUES
                                                           ('Starbucks','Starbucks'),
                                                           ('Toast Box','Toast Box'),
                                                           ('Ya Kun','Ya Kun'),
                                                           ('McDonald''s','McDonalds'),
                                                           ('Grab','Grab'),
                                                           ('ComfortDelGro','ComfortDelGro'),
                                                           ('NTUC FairPrice','NTUC'),
                                                           ('Cold Storage','Cold Storage'),
                                                           ('Shopee','Shopee'),
                                                           ('Lazada','Lazada'),
                                                           ('Amazon','Amazon'),
                                                           ('Apple','Apple'),
                                                           ('Google','Google'),
                                                           ('Netflix','Netflix'),
                                                           ('Spotify','Spotify'),
                                                           ('DBS','DBS'),
                                                           ('OCBC','OCBC'),
                                                           ('UOB','UOB'),
                                                           ('Tiger Brokers','Tiger Brokers'),
                                                           ('IBKR','Interactive Brokers'),
                                                           ('CPF Board','CPF'),
                                                           ('AIA','AIA'),
                                                           ('Prudential','Prudential'),
                                                           ('Binance','Binance'),
                                                           ('Coinbase','Coinbase');