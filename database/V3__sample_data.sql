USE finance_tracker;

-- =========================
-- SAMPLE USER
-- =========================
INSERT INTO users (id, email, password_hash, full_name)
VALUES (
           '11111111-1111-1111-1111-111111111111',
           'test@test.com',
           '$2a$10$dummyhash',
           'Test User'
       );

-- =========================
-- SAMPLE ACCOUNTS
-- =========================
INSERT INTO accounts VALUES
                         ('a1','11111111-1111-1111-1111-111111111111',1,'DBS Savings','DBS','SGD',1,NOW()),
                         ('a2','11111111-1111-1111-1111-111111111111',2,'DBS Visa','DBS','SGD',1,NOW()),
                         ('a3','11111111-1111-1111-1111-111111111111',3,'Tiger Brokers','Tiger','USD',1,NOW()),
                         ('a4','11111111-1111-1111-1111-111111111111',4,'CPF OA','CPF','SGD',1,NOW());

-- =========================
-- SAMPLE TRANSACTIONS
-- =========================

-- Salary
INSERT INTO transactions VALUES
    ('t1','11111111-1111-1111-1111-111111111111','ext','a1',1,1,NULL,NULL,'2026-06-01','Salary',5000,'SGD',1,0,'APPROVED',NOW());

-- Coffee
INSERT INTO transactions VALUES
    ('t2','11111111-1111-1111-1111-111111111111','a1','ext',2,15,1,NULL,'2026-06-02','Starbucks Latte',6.50,'SGD',1,0,'APPROVED',NOW());

-- Investment
INSERT INTO transactions VALUES
    ('t3','11111111-1111-1111-1111-111111111111','a1','a3',5,23,18,NULL,'2026-06-03','Buy ETF',1000,'USD',1,0,'APPROVED',NOW());