-- =============================================================================
-- AVENIR BANK DATABASE INITIALIZATION
-- Based on Domain Entities and Value Objects
-- =============================================================================
-- This script creates the complete database schema that matches exactly
-- the domain layer entities and value objects.
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLE DEFINITIONS (Based on Domain Entities)
-- =============================================================================

-- 1. USERS (Domain: User entity)
-- Fields: id, lastname, firstname, email, role, password, status, emailVerifiedAt
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lastname VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'bankManager', 'bankAdvisor')),
    password TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. SESSIONS (Domain: Session entity)
-- Fields: id, userId, refreshToken, expirationAt, createdAt
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. EMAIL CONFIRMATION TOKENS (Domain: EmailConfirmationToken entity)
-- Fields: userId, token, expiresAt
CREATE TABLE IF NOT EXISTS email_confirmation_tokens (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. ACCOUNTS (Domain: Account entity)
-- Fields: id, accountType, IBAN, accountName, authorizedOverdraft, overdraftLimit, 
--         overdraftFees, status, idOwner, balance, availableBalance
-- AccountType values: 'current', 'savings', 'trading'
-- StatusAccount values: 'open', 'close'
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('current', 'savings', 'trading')),
    iban VARCHAR(34) NOT NULL UNIQUE,
    account_name VARCHAR(255) NOT NULL,
    authorized_overdraft BOOLEAN DEFAULT FALSE,
    overdraft_limit NUMERIC(10,2) DEFAULT 0,
    overdraft_fees NUMERIC(10,2) DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'close')),
    id_owner UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance NUMERIC(10,2) DEFAULT 0,
    available_balance NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. TRANSFERS (Domain: Transfer entity)
-- Fields: id, amount, dateRequested, dateExecuted, description, statusTransfer
-- StatusTransfer values: 'pending', 'validated', 'cancelled'
CREATE TABLE IF NOT EXISTS transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount NUMERIC(10,2) NOT NULL,
    date_requested TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_executed TIMESTAMP,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TRANSACTIONS (Domain: Transaction entity)
-- Fields: id, accountIBAN, transactionDirection, amount, reason, accountDate, status, transferId
-- TransactionDirection values: 'debit', 'credit'
-- StatusTransaction values: 'posted', 'validated'
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_iban VARCHAR(34) NOT NULL,
    transaction_direction VARCHAR(50) NOT NULL CHECK (transaction_direction IN ('debit', 'credit')),
    amount NUMERIC(10,2) NOT NULL,
    reason TEXT,
    account_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'posted' CHECK (status IN ('posted', 'validated')),
    transfer_id UUID REFERENCES transfers(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. CREDITS (Domain: Credit entity)
-- Fields: id, amountBorrowed, annualRate, insuranceRate, durationInMonths, 
--         startDate, status, customerId
-- CreditStatus values: 'in_progress', 'completed'
CREATE TABLE IF NOT EXISTS credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    amount_borrowed NUMERIC(10,2) NOT NULL,
    annual_rate NUMERIC(5,2) NOT NULL,
    insurance_rate NUMERIC(5,2) NOT NULL,
    duration_in_months INTEGER NOT NULL,
    start_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. DUE DATES (Domain: DueDate entity)
-- Fields: id, dueDate, totalAmount, shareInterest, shareInsurance, repaymentPortion,
--         status, creditId, paymentDate?, transferId?
-- DueDateStatus values: 'payable', 'paid', 'overdue', 'cancelled'
CREATE TABLE IF NOT EXISTS due_dates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    due_date DATE NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    share_interest NUMERIC(10,2) NOT NULL,
    share_insurance NUMERIC(10,2) NOT NULL,
    repayment_portion NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'payable' CHECK (status IN ('payable', 'paid', 'overdue', 'cancelled')),
    credit_id UUID NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
    payment_date TIMESTAMP,
    transfer_id UUID REFERENCES transfers(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. SHARES (Domain: Share entity)
-- Fields: id, name, totalNumberOfParts, initialPrice, lastExecutedPrice
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    total_number_of_parts INTEGER NOT NULL,
    initial_price NUMERIC(10,2) NOT NULL,
    last_executed_price NUMERIC(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. SECURITIES POSITIONS (Domain: SecuritiesPosition entity)
-- Fields: id, customerId, shareId, totalQuantity, blockedQuantity
CREATE TABLE IF NOT EXISTS securities_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_id UUID NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    blocked_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, share_id)
);

-- 11. ORDERS (Domain: Order entity)
-- Fields: id, customerId, shareId, direction, quantity, priceLimit, validity,
--         status, dateCaptured, blockedAmount
-- OrderDirection values: 'buy', 'sell' (enum)
-- OrderValidity values: 'day', 'until_cancelled' (enum)
-- OrderStatus values: 'active', 'executed', 'cancelled' (enum)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_id UUID NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
    direction VARCHAR(50) NOT NULL CHECK (direction IN ('buy', 'sell')),
    quantity INTEGER NOT NULL,
    price_limit NUMERIC(10,2) NOT NULL,
    validity VARCHAR(50) NOT NULL CHECK (validity IN ('day', 'until_cancelled')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'executed', 'cancelled')),
    date_captured TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    blocked_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. SHARE TRANSACTIONS (Domain: ShareTransaction entity)
-- Fields: id, shareId, buyOrderId, sellOrderId, buyerId, sellerId, priceExecuted,
--         quantity, dateExecuted, buyerFee, sellerFee
CREATE TABLE IF NOT EXISTS share_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    share_id UUID NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
    buy_order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    sell_order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    price_executed NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    date_executed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    buyer_fee NUMERIC(10,2) DEFAULT 100,
    seller_fee NUMERIC(10,2) DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. CONVERSATIONS (Domain: Conversation entity)
-- Fields: id, status, type, dateOuverture, customerId
-- ConversationStatus values: 'open', 'transferred', 'closed'
-- ConversationType values: 'PRIVATE', 'GROUP'
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'transferred', 'closed')),
    type VARCHAR(50) NOT NULL CHECK (type IN ('PRIVATE', 'GROUP')),
    date_ouverture TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    customer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. MESSAGES (Domain: Message entity)
-- Fields: id, conversationId, senderId, senderRole, text, sendDate
-- senderRole values: 'customer', 'bankAdvisor', 'bankManager'
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_role VARCHAR(50) NOT NULL CHECK (sender_role IN ('customer', 'bankAdvisor', 'bankManager')),
    text TEXT NOT NULL,
    send_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. PARTICIPANT CONVERSATIONS (Domain: ParticipantConversation entity)
-- Fields: id, conversationId, advisorId, dateAdded, dateEnd, estPrincipal
CREATE TABLE IF NOT EXISTS participant_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    advisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_end TIMESTAMP,
    est_principal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. TRANSFER CONVERSATIONS (Domain: TransferConversation entity)
-- Fields: id, conversationId, fromAdvisorId, toAdvisorId, reason, transferDate
CREATE TABLE IF NOT EXISTS transfer_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    from_advisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_advisor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    transfer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- TEST DATA
-- =============================================================================

-- Password hash for "Admin123!": 3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121

-- 1. USERS
INSERT INTO users (id, lastname, firstname, email, role, password, status, email_verified_at) VALUES
-- Admin & Advisors
('00000000-0000-0000-0000-000000000001'::uuid, 'Admin', 'System', 'admin@avenir.com', 'bankManager', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000002'::uuid, 'Dupont', 'Marie', 'marie.dupont@avenir.com', 'bankAdvisor', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000003'::uuid, 'Moreau', 'Pierre', 'pierre.moreau@avenir.com', 'bankAdvisor', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),

-- Customers
('00000000-0000-0000-0000-000000000011'::uuid, 'Martin', 'Jean', 'jean.martin@gmail.com', 'customer', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000012'::uuid, 'Bernard', 'Sophie', 'sophie.bernard@gmail.com', 'customer', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000013'::uuid, 'Petit', 'Luc', 'luc.petit@gmail.com', 'customer', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-0000-0000-000000000099'::uuid, 'Test', 'User', 'test@test.com', 'customer', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP);

-- 2. ACCOUNTS
-- Admin account with 10,000€
INSERT INTO accounts (id, account_type, iban, account_name, authorized_overdraft, overdraft_limit, overdraft_fees, status, id_owner, balance, available_balance) VALUES
('10000000-0000-0000-0000-000000000001'::uuid, 'current', 'FR76 3000 6000 0112 3456 7890 189', 'Compte Admin Principal', true, 1000.00, 7.50, 'open', '00000000-0000-0000-0000-000000000001'::uuid, 10000.00, 11000.00),
('10000000-0000-0000-0000-000000000011'::uuid, 'current', 'FR76 1234 5678 9012 3456 7890 123', 'Compte Courant Jean', true, 500.00, 7.50, 'open', '00000000-0000-0000-0000-000000000011'::uuid, 2500.00, 3000.00),
('10000000-0000-0000-0000-000000000012'::uuid, 'savings', 'FR76 9876 5432 1098 7654 3210 987', 'Livret A Jean', false, 0, 0, 'open', '00000000-0000-0000-0000-000000000011'::uuid, 5000.00, 5000.00),
('10000000-0000-0000-0000-000000000013'::uuid, 'current', 'FR76 1111 2222 3333 4444 5555 666', 'Compte Courant Sophie', false, 0, 0, 'open', '00000000-0000-0000-0000-000000000012'::uuid, 1500.00, 1500.00),
('10000000-0000-0000-0000-000000000014'::uuid, 'trading', 'FR76 7777 8888 9999 0000 1111 222', 'Compte Titres Sophie', false, 0, 0, 'open', '00000000-0000-0000-0000-000000000012'::uuid, 10000.00, 10000.00),
('10000000-0000-0000-0000-000000000015'::uuid, 'current', 'FR76 3333 4444 5555 6666 7777 888', 'Compte Courant Luc', false, 0, 0, 'open', '00000000-0000-0000-0000-000000000013'::uuid, 500.00, 500.00),
('10000000-0000-0000-0000-000000000099'::uuid, 'current', 'FR76 TEST TEST TEST TEST TEST 999', 'Compte Test', true, 200.00, 7.50, 'open', '00000000-0000-0000-0000-000000000099'::uuid, 3000.00, 3200.00);

-- 3. TRANSFERS
INSERT INTO transfers (id, amount, date_requested, date_executed, description, status) VALUES
('20000000-0000-0000-0000-000000000001'::uuid, 500.00, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Virement vers Jean', 'validated'),
('20000000-0000-0000-0000-000000000002'::uuid, 1000.00, CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, 'Virement vers Sophie', 'pending');

-- 4. TRANSACTIONS
INSERT INTO transactions (id, account_iban, transaction_direction, amount, reason, account_date, status, transfer_id) VALUES
('30000000-0000-0000-0000-000000000001'::uuid, 'FR76 3000 6000 0112 3456 7890 189', 'debit', 500.00, 'Virement émis vers Jean Martin', CURRENT_TIMESTAMP - INTERVAL '5 days', 'validated', '20000000-0000-0000-0000-000000000001'::uuid),
('30000000-0000-0000-0000-000000000002'::uuid, 'FR76 1234 5678 9012 3456 7890 123', 'credit', 500.00, 'Virement reçu depuis Admin', CURRENT_TIMESTAMP - INTERVAL '5 days', 'validated', '20000000-0000-0000-0000-000000000001'::uuid),
('30000000-0000-0000-0000-000000000003'::uuid, 'FR76 3000 6000 0112 3456 7890 189', 'debit', 1000.00, 'Virement émis vers Sophie Bernard', CURRENT_TIMESTAMP - INTERVAL '2 days', 'posted', '20000000-0000-0000-0000-000000000002'::uuid),
('30000000-0000-0000-0000-000000000004'::uuid, 'FR76 1111 2222 3333 4444 5555 666', 'credit', 1000.00, 'Virement en attente depuis Admin', CURRENT_TIMESTAMP - INTERVAL '2 days', 'posted', '20000000-0000-0000-0000-000000000002'::uuid),
('30000000-0000-0000-0000-000000000005'::uuid, 'FR76 9876 5432 1098 7654 3210 987', 'credit', 250.00, 'Intérêts Livret A', CURRENT_TIMESTAMP - INTERVAL '10 days', 'validated', NULL),
('30000000-0000-0000-0000-000000000006'::uuid, 'FR76 3333 4444 5555 6666 7777 888', 'debit', 50.00, 'Frais de gestion', CURRENT_TIMESTAMP - INTERVAL '1 day', 'validated', NULL);

-- 5. CREDITS
INSERT INTO credits (id, amount_borrowed, annual_rate, insurance_rate, duration_in_months, start_date, status, customer_id) VALUES
('40000000-0000-0000-0000-000000000001'::uuid, 10000.00, 3.5, 0.36, 12, CURRENT_DATE - INTERVAL '2 months', 'in_progress', '00000000-0000-0000-0000-000000000011'::uuid),
('40000000-0000-0000-0000-000000000002'::uuid, 25000.00, 4.0, 0.40, 24, CURRENT_DATE - INTERVAL '6 months', 'in_progress', '00000000-0000-0000-0000-000000000012'::uuid);

-- 6. DUE DATES (Sample for credits)
INSERT INTO due_dates (id, due_date, total_amount, share_interest, share_insurance, repayment_portion, status, credit_id, payment_date, transfer_id) VALUES
('50000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE - INTERVAL '1 month', 862.00, 29.17, 3.00, 829.83, 'paid', '40000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE - INTERVAL '1 month', NULL),
('50000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE, 862.00, 26.75, 3.00, 832.25, 'payable', '40000000-0000-0000-0000-000000000001'::uuid, NULL, NULL),
('50000000-0000-0000-0000-000000000003'::uuid, CURRENT_DATE + INTERVAL '1 month', 862.00, 24.31, 3.00, 834.69, 'payable', '40000000-0000-0000-0000-000000000001'::uuid, NULL, NULL),

('50000000-0000-0000-0000-000000000011'::uuid, CURRENT_DATE - INTERVAL '5 months', 1100.00, 83.33, 8.33, 1008.34, 'paid', '40000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE - INTERVAL '5 months', NULL),
('50000000-0000-0000-0000-000000000012'::uuid, CURRENT_DATE - INTERVAL '4 months', 1100.00, 79.99, 8.33, 1011.68, 'paid', '40000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE - INTERVAL '4 months', NULL),
('50000000-0000-0000-0000-000000000013'::uuid, CURRENT_DATE, 1100.00, 76.65, 8.33, 1015.02, 'payable', '40000000-0000-0000-0000-000000000002'::uuid, NULL, NULL);

-- 7. SHARES
INSERT INTO shares (id, name, total_number_of_parts, initial_price, last_executed_price) VALUES
('60000000-0000-0000-0000-000000000001'::uuid, 'TechCorp', 10000, 100.00, 105.50),
('60000000-0000-0000-0000-000000000002'::uuid, 'GreenEnergy', 5000, 50.00, 52.00),
('60000000-0000-0000-0000-000000000003'::uuid, 'BioHealth', 8000, 75.00, NULL);

-- 8. SECURITIES POSITIONS
INSERT INTO securities_positions (id, customer_id, share_id, total_quantity, blocked_quantity) VALUES
('70000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 50, 0),
('70000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '60000000-0000-0000-0000-000000000002'::uuid, 100, 10);

-- 9. ORDERS
INSERT INTO orders (id, customer_id, share_id, direction, quantity, price_limit, validity, status, date_captured, blocked_amount) VALUES
('80000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 'buy', 10, 110.00, 'day', 'active', CURRENT_TIMESTAMP, 1200.00),
('80000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000012'::uuid, '60000000-0000-0000-0000-000000000002'::uuid, 'sell', 10, 55.00, 'until_cancelled', 'active', CURRENT_TIMESTAMP, 520.00);

-- 10. CONVERSATIONS
INSERT INTO conversations (id, status, type, date_ouverture, customer_id) VALUES
('90000000-0000-0000-0000-000000000001'::uuid, 'open', 'PRIVATE', CURRENT_TIMESTAMP - INTERVAL '10 days', '00000000-0000-0000-0000-000000000011'::uuid),
('90000000-0000-0000-0000-000000000002'::uuid, 'transferred', 'PRIVATE', CURRENT_TIMESTAMP - INTERVAL '20 days', '00000000-0000-0000-0000-000000000012'::uuid);

-- 11. MESSAGES
INSERT INTO messages (id, conversation_id, sender_id, sender_role, text, send_date) VALUES
('A0000000-0000-0000-0000-000000000001'::uuid, '90000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000011'::uuid, 'customer', 'Bonjour, j''ai une question sur mon crédit.', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('A0000000-0000-0000-0000-000000000002'::uuid, '90000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, 'bankAdvisor', 'Bonjour Jean, je suis à votre écoute.', CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '1 hour');

-- 12. PARTICIPANT CONVERSATIONS
INSERT INTO participant_conversations (id, conversation_id, advisor_id, date_added, date_end, est_principal) VALUES
('B0000000-0000-0000-0000-000000000001'::uuid, '90000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, CURRENT_TIMESTAMP - INTERVAL '10 days', NULL, true),
('B0000000-0000-0000-0000-000000000002'::uuid, '90000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '15 days', true),
('B0000000-0000-0000-0000-000000000003'::uuid, '90000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, CURRENT_TIMESTAMP - INTERVAL '15 days', NULL, true);

-- 13. TRANSFER CONVERSATIONS
INSERT INTO transfer_conversations (id, conversation_id, from_advisor_id, to_advisor_id, reason, transfer_date) VALUES
('C0000000-0000-0000-0000-000000000001'::uuid, '90000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-0000-0000-000000000003'::uuid, 'Transfert de client pour spécialisation en investissements', CURRENT_TIMESTAMP - INTERVAL '15 days');

-- =============================================================================
-- END OF INITIALIZATION
-- =============================================================================
