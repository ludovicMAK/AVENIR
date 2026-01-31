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
-- Fields: id, name, totalNumberOfParts, initialPrice, lastExecutedPrice, isActive
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    total_number_of_parts INTEGER NOT NULL,
    initial_price NUMERIC(10,2) NOT NULL,
    last_executed_price NUMERIC(10,2),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
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
-- Fields: id, subject, status, type, dateOuverture, customerId
-- ConversationStatus values: 'open', 'transferred', 'closed'
-- ConversationType values: 'PRIVATE', 'GROUP'
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(255) NOT NULL DEFAULT 'Conversation',
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
-- TEST DATA - JEU DE DONNÉES COMPLET ET COHÉRENT
-- =============================================================================

-- Password hash for "Admin123!": 3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121
-- Tous les comptes peuvent se connecter avec le mot de passe : Admin123!

-- =============================================================================
-- 1. USERS (16 utilisateurs)
-- =============================================================================
INSERT INTO users (id, lastname, firstname, email, role, password, status, email_verified_at) VALUES
-- ===== DIRECTEUR DE BANQUE (1) =====
('00000000-0000-4000-8000-000000000001'::uuid, 'Dubois', 'Laurent', 'laurent.dubois@avenir.com', 'bankManager', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),

-- ===== CONSEILLERS BANCAIRES (5) =====
('00000000-0000-4000-8000-000000000011'::uuid, 'Dupont', 'Marie', 'marie.dupont@avenir.com', 'bankAdvisor', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-4000-8000-000000000012'::uuid, 'Moreau', 'Pierre', 'pierre.moreau@avenir.com', 'bankAdvisor', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-4000-8000-000000000013'::uuid, 'Laurent', 'Julie', 'julie.laurent@avenir.com', 'bankAdvisor', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-4000-8000-000000000014'::uuid, 'Simon', 'Marc', 'marc.simon@avenir.com', 'bankAdvisor', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-4000-8000-000000000015'::uuid, 'Michel', 'Émilie', 'emilie.michel@avenir.com', 'bankAdvisor', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),

-- ===== CLIENTS (10) =====
('00000000-0000-4000-8000-000000000101'::uuid, 'Martin', 'Jean', 'jean.martin@gmail.com', 'customer', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-4000-8000-000000000102'::uuid, 'Bernard', 'Sophie', 'sophie.bernard@gmail.com', 'customer', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-4000-8000-000000000103'::uuid, 'Petit', 'Luc', 'luc.petit@gmail.com', 'customer', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-4000-8000-000000000104'::uuid, 'Durand', 'Alice', 'alice.durand@gmail.com', 'customer', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-4000-8000-000000000105'::uuid, 'Leroy', 'Paul', 'paul.leroy@gmail.com', 'customer', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-4000-8000-000000000106'::uuid, 'Bonnet', 'Emma', 'emma.bonnet@gmail.com', 'customer', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-4000-8000-000000000107'::uuid, 'Lambert', 'Hugo', 'hugo.lambert@gmail.com', 'customer', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-4000-8000-000000000108'::uuid, 'Garcia', 'Léa', 'lea.garcia@gmail.com', 'customer', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-4000-8000-000000000109'::uuid, 'Fontaine', 'Noah', 'noah.fontaine@gmail.com', 'customer', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP),
('00000000-0000-4000-8000-000000000110'::uuid, 'Chevalier', 'Chloé', 'chloe.chevalier@gmail.com', 'customer', '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121', 'active', CURRENT_TIMESTAMP);

-- =============================================================================
-- 2. ACCOUNTS (26 comptes répartis entre les clients)
-- =============================================================================
INSERT INTO accounts (id, account_type, iban, account_name, authorized_overdraft, overdraft_limit, overdraft_fees, status, id_owner, balance, available_balance) VALUES
-- Laurent Dubois - Directeur de Banque (compte principal avec beaucoup d'argent)
('10000000-0000-0000-0000-000000000001'::uuid, 'current', 'FR76 0000 0001 0001 0001 0001 001', 'Compte Directeur - Trésorerie Principale', true, 10000.00, 0, 'open', '00000000-0000-4000-8000-000000000001'::uuid, 500000.00, 510000.00),

-- Jean Martin (3 comptes : courant + épargne + trading)
('10000000-0000-0000-0000-000000000101'::uuid, 'current', 'FR76 1000 0001 0001 0001 0001 001', 'Compte Courant', true, 500.00, 7.50, 'open', '00000000-0000-4000-8000-000000000101'::uuid, 3500.00, 4000.00),
('10000000-0000-0000-0000-000000000102'::uuid, 'savings', 'FR76 1000 0001 0001 0001 0001 002', 'Livret A', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000101'::uuid, 8000.00, 8000.00),
('10000000-0000-0000-0000-000000000103'::uuid, 'trading', 'FR76 1000 0001 0001 0001 0001 003', 'Compte Titres', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000101'::uuid, 15000.00, 14000.00),

-- Sophie Bernard (3 comptes : courant + épargne + trading)
('10000000-0000-0000-0000-000000000201'::uuid, 'current', 'FR76 1000 0002 0002 0002 0002 001', 'Compte Principal', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000102'::uuid, 2800.00, 2800.00),
('10000000-0000-0000-0000-000000000202'::uuid, 'savings', 'FR76 1000 0002 0002 0002 0002 002', 'Épargne Projet', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000102'::uuid, 12000.00, 12000.00),
('10000000-0000-0000-0000-000000000203'::uuid, 'trading', 'FR76 1000 0002 0002 0002 0002 003', 'Portefeuille Actions', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000102'::uuid, 25000.00, 24000.00),

-- Luc Petit (2 comptes : courant + épargne)
('10000000-0000-0000-0000-000000000301'::uuid, 'current', 'FR76 1000 0003 0003 0003 0003 001', 'Compte Courant', true, 300.00, 7.50, 'open', '00000000-0000-4000-8000-000000000103'::uuid, 1200.00, 1500.00),
('10000000-0000-0000-0000-000000000302'::uuid, 'savings', 'FR76 1000 0003 0003 0003 0003 002', 'Livret Jeune', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000103'::uuid, 3500.00, 3500.00),

-- Alice Durand (3 comptes : courant + épargne + trading)
('10000000-0000-0000-0000-000000000401'::uuid, 'current', 'FR76 1000 0004 0004 0004 0004 001', 'Compte Courant', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000104'::uuid, 5200.00, 5200.00),
('10000000-0000-0000-0000-000000000402'::uuid, 'savings', 'FR76 1000 0004 0004 0004 0004 002', 'Livret A', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000104'::uuid, 15000.00, 15000.00),
('10000000-0000-0000-0000-000000000403'::uuid, 'trading', 'FR76 1000 0004 0004 0004 0004 003', 'Investissements', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000104'::uuid, 30000.00, 28000.00),

-- Paul Leroy (2 comptes : courant + trading)
('10000000-0000-0000-0000-000000000501'::uuid, 'current', 'FR76 1000 0005 0005 0005 0005 001', 'Compte Principal', true, 1000.00, 7.50, 'open', '00000000-0000-4000-8000-000000000105'::uuid, 4500.00, 5500.00),
('10000000-0000-0000-0000-000000000502'::uuid, 'trading', 'FR76 1000 0005 0005 0005 0005 002', 'Trading Actif', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000105'::uuid, 18000.00, 16500.00),

-- Emma Bonnet (3 comptes : courant + épargne + trading)
('10000000-0000-0000-0000-000000000601'::uuid, 'current', 'FR76 1000 0006 0006 0006 0006 001', 'Compte Courant', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000106'::uuid, 3200.00, 3200.00),
('10000000-0000-0000-0000-000000000602'::uuid, 'savings', 'FR76 1000 0006 0006 0006 0006 002', 'Épargne Sécurité', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000106'::uuid, 9000.00, 9000.00),
('10000000-0000-0000-0000-000000000603'::uuid, 'trading', 'FR76 1000 0006 0006 0006 0006 003', 'Bourse', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000106'::uuid, 12000.00, 11000.00),

-- Hugo Lambert (2 comptes : courant + épargne)
('10000000-0000-0000-0000-000000000701'::uuid, 'current', 'FR76 1000 0007 0007 0007 0007 001', 'Compte Courant', true, 500.00, 7.50, 'open', '00000000-0000-4000-8000-000000000107'::uuid, 2100.00, 2600.00),
('10000000-0000-0000-0000-000000000702'::uuid, 'savings', 'FR76 1000 0007 0007 0007 0007 002', 'Livret A', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000107'::uuid, 5500.00, 5500.00),

-- Léa Garcia (2 comptes : courant + trading)
('10000000-0000-0000-0000-000000000801'::uuid, 'current', 'FR76 1000 0008 0008 0008 0008 001', 'Compte Courant', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000108'::uuid, 1800.00, 1800.00),
('10000000-0000-0000-0000-000000000802'::uuid, 'trading', 'FR76 1000 0008 0008 0008 0008 002', 'Trading', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000108'::uuid, 8000.00, 7500.00),

-- Noah Fontaine (1 compte : courant)
('10000000-0000-0000-0000-000000000901'::uuid, 'current', 'FR76 1000 0009 0009 0009 0009 001', 'Compte Courant', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000109'::uuid, 900.00, 900.00),

-- Chloé Chevalier (3 comptes : courant + épargne + trading)
('10000000-0000-0000-0000-000000001001'::uuid, 'current', 'FR76 1000 0010 0010 0010 0010 001', 'Compte Courant', true, 800.00, 7.50, 'open', '00000000-0000-4000-8000-000000000110'::uuid, 6800.00, 7600.00),
('10000000-0000-0000-0000-000000001002'::uuid, 'savings', 'FR76 1000 0010 0010 0010 0010 002', 'Épargne Voyage', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000110'::uuid, 20000.00, 20000.00),
('10000000-0000-0000-0000-000000001003'::uuid, 'trading', 'FR76 1000 0010 0010 0010 0010 003', 'Investissements Long Terme', false, 0, 0, 'open', '00000000-0000-4000-8000-000000000110'::uuid, 35000.00, 33000.00);

-- =============================================================================
-- 3. TRANSFERS (15 virements avec différents statuts)
-- =============================================================================
INSERT INTO transfers (id, amount, date_requested, date_executed, description, status) VALUES
-- Virements validés (10)
('20000000-0000-0000-0000-000000000001'::uuid, 500.00, CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '15 days', 'Virement vers Jean Martin', 'validated'),
('20000000-0000-0000-0000-000000000002'::uuid, 1000.00, CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '12 days', 'Virement entre comptes Sophie', 'validated'),
('20000000-0000-0000-0000-000000000003'::uuid, 800.00, CURRENT_TIMESTAMP - INTERVAL '10 days', CURRENT_TIMESTAMP - INTERVAL '10 days', 'Transfert épargne Alice', 'validated'),
('20000000-0000-0000-0000-000000000004'::uuid, 250.00, CURRENT_TIMESTAMP - INTERVAL '8 days', CURRENT_TIMESTAMP - INTERVAL '8 days', 'Virement vers Paul', 'validated'),
('20000000-0000-0000-0000-000000000005'::uuid, 1500.00, CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days', 'Alimentation compte trading Emma', 'validated'),
('20000000-0000-0000-0000-000000000006'::uuid, 300.00, CURRENT_TIMESTAMP - INTERVAL '6 days', CURRENT_TIMESTAMP - INTERVAL '6 days', 'Virement Hugo vers épargne', 'validated'),
('20000000-0000-0000-0000-000000000007'::uuid, 2000.00, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP - INTERVAL '5 days', 'Virement Chloé vers trading', 'validated'),
('20000000-0000-0000-0000-000000000008'::uuid, 450.00, CURRENT_TIMESTAMP - INTERVAL '4 days', CURRENT_TIMESTAMP - INTERVAL '4 days', 'Virement Jean vers Sophie', 'validated'),
('20000000-0000-0000-0000-000000000009'::uuid, 600.00, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Virement Alice vers Paul', 'validated'),
('20000000-0000-0000-0000-000000000010'::uuid, 900.00, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Virement Paul vers son trading', 'validated'),

-- Virements en attente (3)
('20000000-0000-0000-0000-000000000011'::uuid, 350.00, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, 'Virement en cours Léa', 'pending'),
('20000000-0000-0000-0000-000000000012'::uuid, 1200.00, CURRENT_TIMESTAMP - INTERVAL '6 hours', NULL, 'Virement en cours Sophie vers Jean', 'pending'),
('20000000-0000-0000-0000-000000000013'::uuid, 750.00, CURRENT_TIMESTAMP - INTERVAL '2 hours', NULL, 'Virement en cours Emma', 'pending'),

-- Virements annulés (2)
('20000000-0000-0000-0000-000000000014'::uuid, 5000.00, CURRENT_TIMESTAMP - INTERVAL '20 days', NULL, 'Virement annulé - solde insuffisant', 'cancelled'),
('20000000-0000-0000-0000-000000000015'::uuid, 100.00, CURRENT_TIMESTAMP - INTERVAL '18 days', NULL, 'Virement annulé par client', 'cancelled');

-- =============================================================================
-- 4. TRANSACTIONS (35 transactions)
-- =============================================================================
INSERT INTO transactions (id, account_iban, transaction_direction, amount, reason, account_date, status, transfer_id) VALUES
-- Transactions liées aux virements validés
('30000000-0000-0000-0000-000000000001'::uuid, 'FR76 1000 0001 0001 0001 0001 001', 'credit', 500.00, 'Virement reçu', CURRENT_TIMESTAMP - INTERVAL '15 days', 'validated', '20000000-0000-0000-0000-000000000001'::uuid),
('30000000-0000-0000-0000-000000000002'::uuid, 'FR76 1000 0002 0002 0002 0002 001', 'debit', 1000.00, 'Virement émis vers épargne', CURRENT_TIMESTAMP - INTERVAL '12 days', 'validated', '20000000-0000-0000-0000-000000000002'::uuid),
('30000000-0000-0000-0000-000000000003'::uuid, 'FR76 1000 0002 0002 0002 0002 002', 'credit', 1000.00, 'Virement reçu depuis courant', CURRENT_TIMESTAMP - INTERVAL '12 days', 'validated', '20000000-0000-0000-0000-000000000002'::uuid),
('30000000-0000-0000-0000-000000000004'::uuid, 'FR76 1000 0004 0004 0004 0004 001', 'debit', 800.00, 'Transfert vers épargne', CURRENT_TIMESTAMP - INTERVAL '10 days', 'validated', '20000000-0000-0000-0000-000000000003'::uuid),
('30000000-0000-0000-0000-000000000005'::uuid, 'FR76 1000 0004 0004 0004 0004 002', 'credit', 800.00, 'Virement reçu depuis courant', CURRENT_TIMESTAMP - INTERVAL '10 days', 'validated', '20000000-0000-0000-0000-000000000003'::uuid),
('30000000-0000-0000-0000-000000000006'::uuid, 'FR76 1000 0001 0001 0001 0001 001', 'debit', 250.00, 'Virement émis vers Paul', CURRENT_TIMESTAMP - INTERVAL '8 days', 'validated', '20000000-0000-0000-0000-000000000004'::uuid),
('30000000-0000-0000-0000-000000000007'::uuid, 'FR76 1000 0005 0005 0005 0005 001', 'credit', 250.00, 'Virement reçu de Jean', CURRENT_TIMESTAMP - INTERVAL '8 days', 'validated', '20000000-0000-0000-0000-000000000004'::uuid),
('30000000-0000-0000-0000-000000000008'::uuid, 'FR76 1000 0006 0006 0006 0006 001', 'debit', 1500.00, 'Alimentation compte trading', CURRENT_TIMESTAMP - INTERVAL '7 days', 'validated', '20000000-0000-0000-0000-000000000005'::uuid),
('30000000-0000-0000-0000-000000000009'::uuid, 'FR76 1000 0006 0006 0006 0006 003', 'credit', 1500.00, 'Virement reçu depuis courant', CURRENT_TIMESTAMP - INTERVAL '7 days', 'validated', '20000000-0000-0000-0000-000000000005'::uuid),
('30000000-0000-0000-0000-000000000010'::uuid, 'FR76 1000 0007 0007 0007 0007 001', 'debit', 300.00, 'Virement vers épargne', CURRENT_TIMESTAMP - INTERVAL '6 days', 'validated', '20000000-0000-0000-0000-000000000006'::uuid),
('30000000-0000-0000-0000-000000000011'::uuid, 'FR76 1000 0007 0007 0007 0007 002', 'credit', 300.00, 'Virement reçu depuis courant', CURRENT_TIMESTAMP - INTERVAL '6 days', 'validated', '20000000-0000-0000-0000-000000000006'::uuid),
('30000000-0000-0000-0000-000000000012'::uuid, 'FR76 1000 0010 0010 0010 0010 001', 'debit', 2000.00, 'Virement vers trading', CURRENT_TIMESTAMP - INTERVAL '5 days', 'validated', '20000000-0000-0000-0000-000000000007'::uuid),
('30000000-0000-0000-0000-000000000013'::uuid, 'FR76 1000 0010 0010 0010 0010 003', 'credit', 2000.00, 'Virement reçu depuis courant', CURRENT_TIMESTAMP - INTERVAL '5 days', 'validated', '20000000-0000-0000-0000-000000000007'::uuid),
('30000000-0000-0000-0000-000000000014'::uuid, 'FR76 1000 0001 0001 0001 0001 001', 'debit', 450.00, 'Virement vers Sophie', CURRENT_TIMESTAMP - INTERVAL '4 days', 'validated', '20000000-0000-0000-0000-000000000008'::uuid),
('30000000-0000-0000-0000-000000000015'::uuid, 'FR76 1000 0002 0002 0002 0002 001', 'credit', 450.00, 'Virement reçu de Jean', CURRENT_TIMESTAMP - INTERVAL '4 days', 'validated', '20000000-0000-0000-0000-000000000008'::uuid),
('30000000-0000-0000-0000-000000000016'::uuid, 'FR76 1000 0004 0004 0004 0004 001', 'debit', 600.00, 'Virement vers Paul', CURRENT_TIMESTAMP - INTERVAL '3 days', 'validated', '20000000-0000-0000-0000-000000000009'::uuid),
('30000000-0000-0000-0000-000000000017'::uuid, 'FR76 1000 0005 0005 0005 0005 001', 'credit', 600.00, 'Virement reçu d''Alice', CURRENT_TIMESTAMP - INTERVAL '3 days', 'validated', '20000000-0000-0000-0000-000000000009'::uuid),
('30000000-0000-0000-0000-000000000018'::uuid, 'FR76 1000 0005 0005 0005 0005 001', 'debit', 900.00, 'Alimentation trading', CURRENT_TIMESTAMP - INTERVAL '2 days', 'validated', '20000000-0000-0000-0000-000000000010'::uuid),
('30000000-0000-0000-0000-000000000019'::uuid, 'FR76 1000 0005 0005 0005 0005 002', 'credit', 900.00, 'Virement reçu depuis courant', CURRENT_TIMESTAMP - INTERVAL '2 days', 'validated', '20000000-0000-0000-0000-000000000010'::uuid),

-- Transactions en attente (liées aux virements pending)
('30000000-0000-0000-0000-000000000020'::uuid, 'FR76 1000 0008 0008 0008 0008 001', 'debit', 350.00, 'Virement en cours', CURRENT_TIMESTAMP - INTERVAL '1 day', 'posted', '20000000-0000-0000-0000-000000000011'::uuid),
('30000000-0000-0000-0000-000000000021'::uuid, 'FR76 1000 0008 0008 0008 0008 002', 'credit', 350.00, 'Virement en attente', CURRENT_TIMESTAMP - INTERVAL '1 day', 'posted', '20000000-0000-0000-0000-000000000011'::uuid),
('30000000-0000-0000-0000-000000000022'::uuid, 'FR76 1000 0002 0002 0002 0002 001', 'debit', 1200.00, 'Virement en cours vers Jean', CURRENT_TIMESTAMP - INTERVAL '6 hours', 'posted', '20000000-0000-0000-0000-000000000012'::uuid),
('30000000-0000-0000-0000-000000000023'::uuid, 'FR76 1000 0001 0001 0001 0001 001', 'credit', 1200.00, 'Virement en attente de Sophie', CURRENT_TIMESTAMP - INTERVAL '6 hours', 'posted', '20000000-0000-0000-0000-000000000012'::uuid),

-- Transactions diverses (intérêts, frais, etc.)
('30000000-0000-0000-0000-000000000024'::uuid, 'FR76 1000 0001 0001 0001 0001 002', 'credit', 120.00, 'Intérêts Livret A - Janvier', CURRENT_TIMESTAMP - INTERVAL '30 days', 'validated', NULL),
('30000000-0000-0000-0000-000000000025'::uuid, 'FR76 1000 0002 0002 0002 0002 002', 'credit', 180.00, 'Intérêts Livret A - Janvier', CURRENT_TIMESTAMP - INTERVAL '30 days', 'validated', NULL),
('30000000-0000-0000-0000-000000000026'::uuid, 'FR76 1000 0004 0004 0004 0004 002', 'credit', 225.00, 'Intérêts Livret A - Janvier', CURRENT_TIMESTAMP - INTERVAL '30 days', 'validated', NULL),
('30000000-0000-0000-0000-000000000027'::uuid, 'FR76 1000 0006 0006 0006 0006 002', 'credit', 135.00, 'Intérêts Livret A - Janvier', CURRENT_TIMESTAMP - INTERVAL '30 days', 'validated', NULL),
('30000000-0000-0000-0000-000000000028'::uuid, 'FR76 1000 0010 0010 0010 0010 002', 'credit', 300.00, 'Intérêts Livret A - Janvier', CURRENT_TIMESTAMP - INTERVAL '30 days', 'validated', NULL),
('30000000-0000-0000-0000-000000000029'::uuid, 'FR76 1000 0001 0001 0001 0001 001', 'debit', 7.50, 'Frais découvert autorisé', CURRENT_TIMESTAMP - INTERVAL '5 days', 'validated', NULL),
('30000000-0000-0000-0000-000000000030'::uuid, 'FR76 1000 0005 0005 0005 0005 001', 'debit', 7.50, 'Frais découvert autorisé', CURRENT_TIMESTAMP - INTERVAL '3 days', 'validated', NULL),
('30000000-0000-0000-0000-000000000031'::uuid, 'FR76 1000 0007 0007 0007 0007 001', 'debit', 7.50, 'Frais découvert autorisé', CURRENT_TIMESTAMP - INTERVAL '2 days', 'validated', NULL),
('30000000-0000-0000-0000-000000000032'::uuid, 'FR76 1000 0001 0001 0001 0001 001', 'credit', 2500.00, 'Salaire mensuel', CURRENT_TIMESTAMP - INTERVAL '25 days', 'validated', NULL),
('30000000-0000-0000-0000-000000000033'::uuid, 'FR76 1000 0002 0002 0002 0002 001', 'credit', 3200.00, 'Salaire mensuel', CURRENT_TIMESTAMP - INTERVAL '25 days', 'validated', NULL),
('30000000-0000-0000-0000-000000000034'::uuid, 'FR76 1000 0004 0004 0004 0004 001', 'credit', 4500.00, 'Salaire mensuel', CURRENT_TIMESTAMP - INTERVAL '25 days', 'validated', NULL),
('30000000-0000-0000-0000-000000000035'::uuid, 'FR76 1000 0010 0010 0010 0010 001', 'credit', 5800.00, 'Salaire mensuel', CURRENT_TIMESTAMP - INTERVAL '25 days', 'validated', NULL);

-- =============================================================================
-- 5. CREDITS (8 crédits avec différentes caractéristiques)
-- =============================================================================
INSERT INTO credits (id, amount_borrowed, annual_rate, insurance_rate, duration_in_months, start_date, status, customer_id) VALUES
-- Crédit Jean Martin - 10 000€ sur 12 mois (déjà 3 mois payés)
('40000000-0000-0000-0000-000000000001'::uuid, 10000.00, 3.50, 0.36, 12, CURRENT_DATE - INTERVAL '3 months', 'in_progress', '00000000-0000-4000-8000-000000000101'::uuid),

-- Crédit Sophie Bernard - 25 000€ sur 24 mois (déjà 8 mois payés)
('40000000-0000-0000-0000-000000000002'::uuid, 25000.00, 4.00, 0.40, 24, CURRENT_DATE - INTERVAL '8 months', 'in_progress', '00000000-0000-4000-8000-000000000102'::uuid),

-- Crédit Luc Petit - 5 000€ sur 12 mois (nouveau, 1 mois)
('40000000-0000-0000-0000-000000000003'::uuid, 5000.00, 3.00, 0.35, 12, CURRENT_DATE - INTERVAL '1 month', 'in_progress', '00000000-0000-4000-8000-000000000103'::uuid),

-- Crédit Alice Durand - 50 000€ sur 60 mois (déjà 12 mois payés)
('40000000-0000-0000-0000-000000000004'::uuid, 50000.00, 4.50, 0.45, 60, CURRENT_DATE - INTERVAL '12 months', 'in_progress', '00000000-0000-4000-8000-000000000104'::uuid),

-- Crédit Paul Leroy - 15 000€ sur 24 mois (déjà 6 mois payés)
('40000000-0000-0000-0000-000000000005'::uuid, 15000.00, 3.80, 0.38, 24, CURRENT_DATE - INTERVAL '6 months', 'in_progress', '00000000-0000-4000-8000-000000000105'::uuid),

-- Crédit Emma Bonnet - 8 000€ sur 18 mois (déjà 4 mois payés)
('40000000-0000-0000-0000-000000000006'::uuid, 8000.00, 3.20, 0.36, 18, CURRENT_DATE - INTERVAL '4 months', 'in_progress', '00000000-0000-4000-8000-000000000106'::uuid),

-- Crédit Hugo Lambert - 12 000€ sur 12 mois (TERMINÉ)
('40000000-0000-0000-0000-000000000007'::uuid, 12000.00, 3.50, 0.36, 12, CURRENT_DATE - INTERVAL '13 months', 'completed', '00000000-0000-4000-8000-000000000107'::uuid),

-- Crédit Chloé Chevalier - 35 000€ sur 36 mois (déjà 10 mois payés)
('40000000-0000-0000-0000-000000000008'::uuid, 35000.00, 4.20, 0.42, 36, CURRENT_DATE - INTERVAL '10 months', 'in_progress', '00000000-0000-4000-8000-000000000110'::uuid);

-- =============================================================================
-- 6. DUE DATES (Échéances pour les crédits - environ 100 échéances)
-- =============================================================================

-- Échéances CRÉDIT 1 : Jean Martin (10 000€ sur 12 mois, mensualité ~862€)
INSERT INTO due_dates (id, due_date, total_amount, share_interest, share_insurance, repayment_portion, status, credit_id, payment_date, transfer_id) VALUES
('50000000-0000-0000-0000-000000000101'::uuid, CURRENT_DATE - INTERVAL '3 months', 862.00, 29.17, 3.00, 829.83, 'paid', '40000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE - INTERVAL '3 months', NULL),
('50000000-0000-0000-0000-000000000102'::uuid, CURRENT_DATE - INTERVAL '2 months', 862.00, 26.75, 3.00, 832.25, 'paid', '40000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE - INTERVAL '2 months', NULL),
('50000000-0000-0000-0000-000000000103'::uuid, CURRENT_DATE - INTERVAL '1 month', 862.00, 24.31, 3.00, 834.69, 'paid', '40000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE - INTERVAL '1 month', NULL),
('50000000-0000-0000-0000-000000000104'::uuid, CURRENT_DATE, 862.00, 21.85, 3.00, 837.15, 'payable', '40000000-0000-0000-0000-000000000001'::uuid, NULL, NULL),
('50000000-0000-0000-0000-000000000105'::uuid, CURRENT_DATE + INTERVAL '1 month', 862.00, 19.38, 3.00, 839.62, 'payable', '40000000-0000-0000-0000-000000000001'::uuid, NULL, NULL),
('50000000-0000-0000-0000-000000000106'::uuid, CURRENT_DATE + INTERVAL '2 months', 862.00, 16.89, 3.00, 842.11, 'payable', '40000000-0000-0000-0000-000000000001'::uuid, NULL, NULL),
('50000000-0000-0000-0000-000000000107'::uuid, CURRENT_DATE + INTERVAL '3 months', 862.00, 14.39, 3.00, 844.61, 'payable', '40000000-0000-0000-0000-000000000001'::uuid, NULL, NULL),
('50000000-0000-0000-0000-000000000108'::uuid, CURRENT_DATE + INTERVAL '4 months', 862.00, 11.88, 3.00, 847.12, 'payable', '40000000-0000-0000-0000-000000000001'::uuid, NULL, NULL),
('50000000-0000-0000-0000-000000000109'::uuid, CURRENT_DATE + INTERVAL '5 months', 862.00, 9.35, 3.00, 849.65, 'payable', '40000000-0000-0000-0000-000000000001'::uuid, NULL, NULL),
('50000000-0000-0000-0000-000000000110'::uuid, CURRENT_DATE + INTERVAL '6 months', 862.00, 6.81, 3.00, 852.19, 'payable', '40000000-0000-0000-0000-000000000001'::uuid, NULL, NULL),
('50000000-0000-0000-0000-000000000111'::uuid, CURRENT_DATE + INTERVAL '7 months', 862.00, 4.26, 3.00, 854.74, 'payable', '40000000-0000-0000-0000-000000000001'::uuid, NULL, NULL),
('50000000-0000-0000-0000-000000000112'::uuid, CURRENT_DATE + INTERVAL '8 months', 862.00, 1.69, 3.00, 857.31, 'payable', '40000000-0000-0000-0000-000000000001'::uuid, NULL, NULL),

-- Échéances CRÉDIT 2 : Sophie Bernard (25 000€ sur 24 mois, mensualité ~1100€) - 8 payées
('50000000-0000-0000-0000-000000000201'::uuid, CURRENT_DATE - INTERVAL '8 months', 1100.00, 83.33, 8.33, 1008.34, 'paid', '40000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE - INTERVAL '8 months', NULL),
('50000000-0000-0000-0000-000000000202'::uuid, CURRENT_DATE - INTERVAL '7 months', 1100.00, 79.99, 8.33, 1011.68, 'paid', '40000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE - INTERVAL '7 months', NULL),
('50000000-0000-0000-0000-000000000203'::uuid, CURRENT_DATE - INTERVAL '6 months', 1100.00, 76.65, 8.33, 1015.02, 'paid', '40000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE - INTERVAL '6 months', NULL),
('50000000-0000-0000-0000-000000000204'::uuid, CURRENT_DATE - INTERVAL '5 months', 1100.00, 73.31, 8.33, 1018.36, 'paid', '40000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE - INTERVAL '5 months', NULL),
('50000000-0000-0000-0000-000000000205'::uuid, CURRENT_DATE - INTERVAL '4 months', 1100.00, 69.96, 8.33, 1021.71, 'paid', '40000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE - INTERVAL '4 months', NULL),
('50000000-0000-0000-0000-000000000206'::uuid, CURRENT_DATE - INTERVAL '3 months', 1100.00, 66.60, 8.33, 1025.07, 'paid', '40000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE - INTERVAL '3 months', NULL),
('50000000-0000-0000-0000-000000000207'::uuid, CURRENT_DATE - INTERVAL '2 months', 1100.00, 63.24, 8.33, 1028.43, 'paid', '40000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE - INTERVAL '2 months', NULL),
('50000000-0000-0000-0000-000000000208'::uuid, CURRENT_DATE - INTERVAL '1 month', 1100.00, 59.87, 8.33, 1031.80, 'paid', '40000000-0000-0000-0000-000000000002'::uuid, CURRENT_DATE - INTERVAL '1 month', NULL),
('50000000-0000-0000-0000-000000000209'::uuid, CURRENT_DATE, 1100.00, 56.49, 8.33, 1035.18, 'payable', '40000000-0000-0000-0000-000000000002'::uuid, NULL, NULL),
('50000000-0000-0000-0000-000000000210'::uuid, CURRENT_DATE + INTERVAL '1 month', 1100.00, 53.11, 8.33, 1038.56, 'payable', '40000000-0000-0000-0000-000000000002'::uuid, NULL, NULL),

-- Échéances CRÉDIT 3 : Luc Petit (5 000€ sur 12 mois, mensualité ~430€) - 1 payée
('50000000-0000-0000-0000-000000000301'::uuid, CURRENT_DATE - INTERVAL '1 month', 430.00, 12.50, 1.46, 416.04, 'paid', '40000000-0000-0000-0000-000000000003'::uuid, CURRENT_DATE - INTERVAL '1 month', NULL),
('50000000-0000-0000-0000-000000000302'::uuid, CURRENT_DATE, 430.00, 11.46, 1.46, 417.08, 'payable', '40000000-0000-0000-0000-000000000003'::uuid, NULL, NULL),
('50000000-0000-0000-0000-000000000303'::uuid, CURRENT_DATE + INTERVAL '1 month', 430.00, 10.42, 1.46, 418.12, 'payable', '40000000-0000-0000-0000-000000000003'::uuid, NULL, NULL),

-- Échéances CRÉDIT 4 : Alice Durand (50 000€ sur 60 mois, mensualité ~950€) - 12 payées
('50000000-0000-0000-0000-000000000401'::uuid, CURRENT_DATE - INTERVAL '12 months', 950.00, 187.50, 18.75, 743.75, 'paid', '40000000-0000-0000-0000-000000000004'::uuid, CURRENT_DATE - INTERVAL '12 months', NULL),
('50000000-0000-0000-0000-000000000402'::uuid, CURRENT_DATE - INTERVAL '11 months', 950.00, 184.71, 18.75, 746.54, 'paid', '40000000-0000-0000-0000-000000000004'::uuid, CURRENT_DATE - INTERVAL '11 months', NULL),
('50000000-0000-0000-0000-000000000403'::uuid, CURRENT_DATE - INTERVAL '10 months', 950.00, 181.91, 18.75, 749.34, 'paid', '40000000-0000-0000-0000-000000000004'::uuid, CURRENT_DATE - INTERVAL '10 months', NULL),
('50000000-0000-0000-0000-000000000404'::uuid, CURRENT_DATE - INTERVAL '9 months', 950.00, 179.10, 18.75, 752.15, 'paid', '40000000-0000-0000-0000-000000000004'::uuid, CURRENT_DATE - INTERVAL '9 months', NULL),
('50000000-0000-0000-0000-000000000405'::uuid, CURRENT_DATE - INTERVAL '8 months', 950.00, 176.28, 18.75, 754.97, 'paid', '40000000-0000-0000-0000-000000000004'::uuid, CURRENT_DATE - INTERVAL '8 months', NULL),
('50000000-0000-0000-0000-000000000406'::uuid, CURRENT_DATE - INTERVAL '7 months', 950.00, 173.45, 18.75, 757.80, 'paid', '40000000-0000-0000-0000-000000000004'::uuid, CURRENT_DATE - INTERVAL '7 months', NULL),
('50000000-0000-0000-0000-000000000407'::uuid, CURRENT_DATE - INTERVAL '6 months', 950.00, 170.62, 18.75, 760.63, 'paid', '40000000-0000-0000-0000-000000000004'::uuid, CURRENT_DATE - INTERVAL '6 months', NULL),
('50000000-0000-0000-0000-000000000408'::uuid, CURRENT_DATE - INTERVAL '5 months', 950.00, 167.77, 18.75, 763.48, 'paid', '40000000-0000-0000-0000-000000000004'::uuid, CURRENT_DATE - INTERVAL '5 months', NULL),
('50000000-0000-0000-0000-000000000409'::uuid, CURRENT_DATE - INTERVAL '4 months', 950.00, 164.92, 18.75, 766.33, 'paid', '40000000-0000-0000-0000-000000000004'::uuid, CURRENT_DATE - INTERVAL '4 months', NULL),
('50000000-0000-0000-0000-000000000410'::uuid, CURRENT_DATE - INTERVAL '3 months', 950.00, 162.05, 18.75, 769.20, 'paid', '40000000-0000-0000-0000-000000000004'::uuid, CURRENT_DATE - INTERVAL '3 months', NULL),
('50000000-0000-0000-0000-000000000411'::uuid, CURRENT_DATE - INTERVAL '2 months', 950.00, 159.18, 18.75, 772.07, 'paid', '40000000-0000-0000-0000-000000000004'::uuid, CURRENT_DATE - INTERVAL '2 months', NULL),
('50000000-0000-0000-0000-000000000412'::uuid, CURRENT_DATE - INTERVAL '1 month', 950.00, 156.29, 18.75, 774.96, 'paid', '40000000-0000-0000-0000-000000000004'::uuid, CURRENT_DATE - INTERVAL '1 month', NULL),
('50000000-0000-0000-0000-000000000413'::uuid, CURRENT_DATE, 950.00, 153.40, 18.75, 777.85, 'payable', '40000000-0000-0000-0000-000000000004'::uuid, NULL, NULL),

-- Échéances CRÉDIT 5 : Paul Leroy (15 000€ sur 24 mois, mensualité ~670€) - 6 payées
('50000000-0000-0000-0000-000000000501'::uuid, CURRENT_DATE - INTERVAL '6 months', 670.00, 47.50, 4.75, 617.75, 'paid', '40000000-0000-0000-0000-000000000005'::uuid, CURRENT_DATE - INTERVAL '6 months', NULL),
('50000000-0000-0000-0000-000000000502'::uuid, CURRENT_DATE - INTERVAL '5 months', 670.00, 45.55, 4.75, 619.70, 'paid', '40000000-0000-0000-0000-000000000005'::uuid, CURRENT_DATE - INTERVAL '5 months', NULL),
('50000000-0000-0000-0000-000000000503'::uuid, CURRENT_DATE - INTERVAL '4 months', 670.00, 43.59, 4.75, 621.66, 'paid', '40000000-0000-0000-0000-000000000005'::uuid, CURRENT_DATE - INTERVAL '4 months', NULL),
('50000000-0000-0000-0000-000000000504'::uuid, CURRENT_DATE - INTERVAL '3 months', 670.00, 41.63, 4.75, 623.62, 'paid', '40000000-0000-0000-0000-000000000005'::uuid, CURRENT_DATE - INTERVAL '3 months', NULL),
('50000000-0000-0000-0000-000000000505'::uuid, CURRENT_DATE - INTERVAL '2 months', 670.00, 39.66, 4.75, 625.59, 'paid', '40000000-0000-0000-0000-000000000005'::uuid, CURRENT_DATE - INTERVAL '2 months', NULL),
('50000000-0000-0000-0000-000000000506'::uuid, CURRENT_DATE - INTERVAL '1 month', 670.00, 37.69, 4.75, 627.56, 'paid', '40000000-0000-0000-0000-000000000005'::uuid, CURRENT_DATE - INTERVAL '1 month', NULL),
('50000000-0000-0000-0000-000000000507'::uuid, CURRENT_DATE, 670.00, 35.71, 4.75, 629.54, 'payable', '40000000-0000-0000-0000-000000000005'::uuid, NULL, NULL),

-- Échéances CRÉDIT 6 : Emma Bonnet (8 000€ sur 18 mois, mensualité ~470€) - 4 payées
('50000000-0000-0000-0000-000000000601'::uuid, CURRENT_DATE - INTERVAL '4 months', 470.00, 21.33, 2.40, 446.27, 'paid', '40000000-0000-0000-0000-000000000006'::uuid, CURRENT_DATE - INTERVAL '4 months', NULL),
('50000000-0000-0000-0000-000000000602'::uuid, CURRENT_DATE - INTERVAL '3 months', 470.00, 20.14, 2.40, 447.46, 'paid', '40000000-0000-0000-0000-000000000006'::uuid, CURRENT_DATE - INTERVAL '3 months', NULL),
('50000000-0000-0000-0000-000000000603'::uuid, CURRENT_DATE - INTERVAL '2 months', 470.00, 18.95, 2.40, 448.65, 'paid', '40000000-0000-0000-0000-000000000006'::uuid, CURRENT_DATE - INTERVAL '2 months', NULL),
('50000000-0000-0000-0000-000000000604'::uuid, CURRENT_DATE - INTERVAL '1 month', 470.00, 17.76, 2.40, 449.84, 'paid', '40000000-0000-0000-0000-000000000006'::uuid, CURRENT_DATE - INTERVAL '1 month', NULL),
('50000000-0000-0000-0000-000000000605'::uuid, CURRENT_DATE, 470.00, 16.56, 2.40, 451.04, 'payable', '40000000-0000-0000-0000-000000000006'::uuid, NULL, NULL),

-- Échéances CRÉDIT 7 : Hugo Lambert (12 000€ sur 12 mois, TERMINÉ) - toutes payées
('50000000-0000-0000-0000-000000000701'::uuid, CURRENT_DATE - INTERVAL '13 months', 1035.00, 35.00, 3.60, 996.40, 'paid', '40000000-0000-0000-0000-000000000007'::uuid, CURRENT_DATE - INTERVAL '13 months', NULL),
('50000000-0000-0000-0000-000000000702'::uuid, CURRENT_DATE - INTERVAL '12 months', 1035.00, 32.09, 3.60, 999.31, 'paid', '40000000-0000-0000-0000-000000000007'::uuid, CURRENT_DATE - INTERVAL '12 months', NULL),
('50000000-0000-0000-0000-000000000712'::uuid, CURRENT_DATE - INTERVAL '2 months', 1035.00, 6.05, 3.60, 1025.35, 'paid', '40000000-0000-0000-0000-000000000007'::uuid, CURRENT_DATE - INTERVAL '2 months', NULL),

-- Échéances CRÉDIT 8 : Chloé Chevalier (35 000€ sur 36 mois, mensualité ~1060€) - 10 payées
('50000000-0000-0000-0000-000000000801'::uuid, CURRENT_DATE - INTERVAL '10 months', 1060.00, 122.50, 12.25, 925.25, 'paid', '40000000-0000-0000-0000-000000000008'::uuid, CURRENT_DATE - INTERVAL '10 months', NULL),
('50000000-0000-0000-0000-000000000802'::uuid, CURRENT_DATE - INTERVAL '9 months', 1060.00, 119.27, 12.25, 928.48, 'paid', '40000000-0000-0000-0000-000000000008'::uuid, CURRENT_DATE - INTERVAL '9 months', NULL),
('50000000-0000-0000-0000-000000000803'::uuid, CURRENT_DATE - INTERVAL '8 months', 1060.00, 116.04, 12.25, 931.71, 'paid', '40000000-0000-0000-0000-000000000008'::uuid, CURRENT_DATE - INTERVAL '8 months', NULL),
('50000000-0000-0000-0000-000000000804'::uuid, CURRENT_DATE - INTERVAL '7 months', 1060.00, 112.79, 12.25, 934.96, 'paid', '40000000-0000-0000-0000-000000000008'::uuid, CURRENT_DATE - INTERVAL '7 months', NULL),
('50000000-0000-0000-0000-000000000805'::uuid, CURRENT_DATE - INTERVAL '6 months', 1060.00, 109.53, 12.25, 938.22, 'paid', '40000000-0000-0000-0000-000000000008'::uuid, CURRENT_DATE - INTERVAL '6 months', NULL),
('50000000-0000-0000-0000-000000000806'::uuid, CURRENT_DATE - INTERVAL '5 months', 1060.00, 106.27, 12.25, 941.48, 'paid', '40000000-0000-0000-0000-000000000008'::uuid, CURRENT_DATE - INTERVAL '5 months', NULL),
('50000000-0000-0000-0000-000000000807'::uuid, CURRENT_DATE - INTERVAL '4 months', 1060.00, 103.00, 12.25, 944.75, 'paid', '40000000-0000-0000-0000-000000000008'::uuid, CURRENT_DATE - INTERVAL '4 months', NULL),
('50000000-0000-0000-0000-000000000808'::uuid, CURRENT_DATE - INTERVAL '3 months', 1060.00, 99.71, 12.25, 948.04, 'paid', '40000000-0000-0000-0000-000000000008'::uuid, CURRENT_DATE - INTERVAL '3 months', NULL),
('50000000-0000-0000-0000-000000000809'::uuid, CURRENT_DATE - INTERVAL '2 months', 1060.00, 96.42, 12.25, 951.33, 'paid', '40000000-0000-0000-0000-000000000008'::uuid, CURRENT_DATE - INTERVAL '2 months', NULL),
('50000000-0000-0000-0000-000000000810'::uuid, CURRENT_DATE - INTERVAL '1 month', 1060.00, 93.12, 12.25, 954.63, 'paid', '40000000-0000-0000-0000-000000000008'::uuid, CURRENT_DATE - INTERVAL '1 month', NULL),
('50000000-0000-0000-0000-000000000811'::uuid, CURRENT_DATE, 1060.00, 89.81, 12.25, 957.94, 'payable', '40000000-0000-0000-0000-000000000008'::uuid, NULL, NULL);

-- =============================================================================
-- 7. SHARES (10 actions variées)
-- =============================================================================
INSERT INTO shares (id, name, total_number_of_parts, initial_price, last_executed_price) VALUES
('60000000-0000-0000-0000-000000000001'::uuid, 'TechNova Corp', 1000000, 100.00, 105.50),
('60000000-0000-0000-0000-000000000002'::uuid, 'GreenEnergy SA', 500000, 50.00, 52.30),
('60000000-0000-0000-0000-000000000003'::uuid, 'BioHealth Labs', 800000, 75.00, 78.90),
('60000000-0000-0000-0000-000000000004'::uuid, 'FinanceFirst', 600000, 120.00, 118.75),
('60000000-0000-0000-0000-000000000005'::uuid, 'AutoDrive Tech', 750000, 85.00, 92.40),
('60000000-0000-0000-0000-000000000006'::uuid, 'FoodChain Global', 400000, 45.00, 47.80),
('60000000-0000-0000-0000-000000000007'::uuid, 'CloudNet Services', 900000, 150.00, 165.20),
('60000000-0000-0000-0000-000000000008'::uuid, 'Quantum Computing', 300000, 200.00, NULL),
('60000000-0000-0000-0000-000000000009'::uuid, 'EcoConstruct', 550000, 60.00, 58.50),
('60000000-0000-0000-0000-000000000010'::uuid, 'MediCare Plus', 700000, 95.00, 99.10);

-- =============================================================================
-- 8. SECURITIES POSITIONS (Positions des clients investisseurs)
-- =============================================================================
INSERT INTO securities_positions (id, customer_id, share_id, total_quantity, blocked_quantity) VALUES
-- Jean Martin
('70000000-0000-0000-0000-000000000101'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 25, 10),
('70000000-0000-0000-0000-000000000102'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, '60000000-0000-0000-0000-000000000002'::uuid, 50, 0),

-- Sophie Bernard (investisseuse active)
('70000000-0000-0000-0000-000000000201'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 100, 0),
('70000000-0000-0000-0000-000000000202'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, '60000000-0000-0000-0000-000000000003'::uuid, 75, 20),
('70000000-0000-0000-0000-000000000203'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, '60000000-0000-0000-0000-000000000005'::uuid, 60, 0),
('70000000-0000-0000-0000-000000000204'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, '60000000-0000-0000-0000-000000000007'::uuid, 40, 10),

-- Alice Durand (grosse investisseuse)
('70000000-0000-0000-0000-000000000401'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 150, 0),
('70000000-0000-0000-0000-000000000402'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, '60000000-0000-0000-0000-000000000004'::uuid, 80, 0),
('70000000-0000-0000-0000-000000000403'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, '60000000-0000-0000-0000-000000000007'::uuid, 90, 20),
('70000000-0000-0000-0000-000000000404'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, '60000000-0000-0000-0000-000000000010'::uuid, 70, 0),

-- Paul Leroy
('70000000-0000-0000-0000-000000000501'::uuid, '00000000-0000-4000-8000-000000000105'::uuid, '60000000-0000-0000-0000-000000000002'::uuid, 120, 15),
('70000000-0000-0000-0000-000000000502'::uuid, '00000000-0000-4000-8000-000000000105'::uuid, '60000000-0000-0000-0000-000000000005'::uuid, 45, 0),
('70000000-0000-0000-0000-000000000503'::uuid, '00000000-0000-4000-8000-000000000105'::uuid, '60000000-0000-0000-0000-000000000009'::uuid, 80, 0),

-- Emma Bonnet
('70000000-0000-0000-0000-000000000601'::uuid, '00000000-0000-4000-8000-000000000106'::uuid, '60000000-0000-0000-0000-000000000003'::uuid, 55, 10),
('70000000-0000-0000-0000-000000000602'::uuid, '00000000-0000-4000-8000-000000000106'::uuid, '60000000-0000-0000-0000-000000000006'::uuid, 90, 0),
('70000000-0000-0000-0000-000000000603'::uuid, '00000000-0000-4000-8000-000000000106'::uuid, '60000000-0000-0000-0000-000000000010'::uuid, 40, 0),

-- Léa Garcia
('70000000-0000-0000-0000-000000000801'::uuid, '00000000-0000-4000-8000-000000000108'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 30, 5),
('70000000-0000-0000-0000-000000000802'::uuid, '00000000-0000-4000-8000-000000000108'::uuid, '60000000-0000-0000-0000-000000000004'::uuid, 25, 0),

-- Chloé Chevalier (très active)
('70000000-0000-0000-0000-000000001001'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 200, 20),
('70000000-0000-0000-0000-000000001002'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, '60000000-0000-0000-0000-000000000005'::uuid, 100, 0),
('70000000-0000-0000-0000-000000001003'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, '60000000-0000-0000-0000-000000000007'::uuid, 120, 0),
('70000000-0000-0000-0000-000000001004'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, '60000000-0000-0000-0000-000000000009'::uuid, 85, 15);

-- =============================================================================
-- 9. ORDERS (30 ordres : actifs, exécutés et annulés)
-- =============================================================================
INSERT INTO orders (id, customer_id, share_id, direction, quantity, price_limit, validity, status, date_captured, blocked_amount) VALUES
-- ORDRES ACTIFS - BUY (10)
('80000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 'buy', 10, 106.00, 'day', 'active', CURRENT_TIMESTAMP - INTERVAL '2 hours', 1061.00),
('80000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, '60000000-0000-0000-0000-000000000004'::uuid, 'buy', 5, 120.00, 'until_cancelled', 'active', CURRENT_TIMESTAMP - INTERVAL '1 day', 601.00),
('80000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, '60000000-0000-0000-0000-000000000002'::uuid, 'buy', 20, 53.00, 'day', 'active', CURRENT_TIMESTAMP - INTERVAL '4 hours', 1061.00),
('80000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-4000-8000-000000000105'::uuid, '60000000-0000-0000-0000-000000000007'::uuid, 'buy', 8, 166.00, 'until_cancelled', 'active', CURRENT_TIMESTAMP - INTERVAL '3 days', 1329.00),
('80000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-4000-8000-000000000106'::uuid, '60000000-0000-0000-0000-000000000010'::uuid, 'buy', 12, 100.00, 'day', 'active', CURRENT_TIMESTAMP - INTERVAL '1 hour', 1201.00),
('80000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-4000-8000-000000000108'::uuid, '60000000-0000-0000-0000-000000000008'::uuid, 'buy', 3, 205.00, 'until_cancelled', 'active', CURRENT_TIMESTAMP - INTERVAL '5 hours', 616.00),
('80000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, '60000000-0000-0000-0000-000000000003'::uuid, 'buy', 15, 80.00, 'day', 'active', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 1201.00),
('80000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, '60000000-0000-0000-0000-000000000005'::uuid, 'buy', 6, 93.00, 'until_cancelled', 'active', CURRENT_TIMESTAMP - INTERVAL '2 days', 559.00),
('80000000-0000-0000-0000-000000000009'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, '60000000-0000-0000-0000-000000000006'::uuid, 'buy', 25, 48.00, 'day', 'active', CURRENT_TIMESTAMP - INTERVAL '6 hours', 1201.00),
('80000000-0000-0000-0000-000000000010'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, '60000000-0000-0000-0000-000000000009'::uuid, 'buy', 18, 59.00, 'until_cancelled', 'active', CURRENT_TIMESTAMP - INTERVAL '12 hours', 1063.00),

-- ORDRES ACTIFS - SELL (10)
('80000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 'sell', 10, 108.00, 'day', 'active', CURRENT_TIMESTAMP - INTERVAL '3 hours', 1055.00),
('80000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, '60000000-0000-0000-0000-000000000003'::uuid, 'sell', 20, 82.00, 'until_cancelled', 'active', CURRENT_TIMESTAMP - INTERVAL '1 day', 1578.00),
('80000000-0000-0000-0000-000000000013'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, '60000000-0000-0000-0000-000000000007'::uuid, 'sell', 20, 168.00, 'day', 'active', CURRENT_TIMESTAMP - INTERVAL '5 hours', 3304.00),
('80000000-0000-0000-0000-000000000014'::uuid, '00000000-0000-4000-8000-000000000105'::uuid, '60000000-0000-0000-0000-000000000002'::uuid, 'sell', 15, 54.00, 'until_cancelled', 'active', CURRENT_TIMESTAMP - INTERVAL '2 days', 784.50),
('80000000-0000-0000-0000-000000000015'::uuid, '00000000-0000-4000-8000-000000000106'::uuid, '60000000-0000-0000-0000-000000000003'::uuid, 'sell', 10, 81.00, 'day', 'active', CURRENT_TIMESTAMP - INTERVAL '4 hours', 789.00),
('80000000-0000-0000-0000-000000000016'::uuid, '00000000-0000-4000-8000-000000000108'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 'sell', 5, 107.00, 'until_cancelled', 'active', CURRENT_TIMESTAMP - INTERVAL '8 hours', 527.50),
('80000000-0000-0000-0000-000000000017'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, '60000000-0000-0000-0000-000000000009'::uuid, 'sell', 15, 60.00, 'day', 'active', CURRENT_TIMESTAMP - INTERVAL '1 hour', 877.50),
('80000000-0000-0000-0000-000000000018'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 'sell', 20, 109.00, 'until_cancelled', 'active', CURRENT_TIMESTAMP - INTERVAL '10 hours', 2110.00),
('80000000-0000-0000-0000-000000000019'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, '60000000-0000-0000-0000-000000000007'::uuid, 'sell', 10, 170.00, 'day', 'active', CURRENT_TIMESTAMP - INTERVAL '30 minutes', 1652.00),
('80000000-0000-0000-0000-000000000020'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, '60000000-0000-0000-0000-000000000010'::uuid, 'sell', 12, 102.00, 'until_cancelled', 'active', CURRENT_TIMESTAMP - INTERVAL '6 hours', 1189.20),

-- ORDRES EXÉCUTÉS (5)
('80000000-0000-0000-0000-000000000021'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 'buy', 50, 104.00, 'day', 'executed', CURRENT_TIMESTAMP - INTERVAL '10 days', 5201.00),
('80000000-0000-0000-0000-000000000022'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, 'sell', 50, 104.00, 'day', 'executed', CURRENT_TIMESTAMP - INTERVAL '10 days', 5200.00),
('80000000-0000-0000-0000-000000000023'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, '60000000-0000-0000-0000-000000000005'::uuid, 'buy', 30, 90.00, 'until_cancelled', 'executed', CURRENT_TIMESTAMP - INTERVAL '5 days', 2701.00),
('80000000-0000-0000-0000-000000000024'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, '60000000-0000-0000-0000-000000000005'::uuid, 'sell', 30, 90.00, 'until_cancelled', 'executed', CURRENT_TIMESTAMP - INTERVAL '5 days', 2700.00),
('80000000-0000-0000-0000-000000000025'::uuid, '00000000-0000-4000-8000-000000000105'::uuid, '60000000-0000-0000-0000-000000000009'::uuid, 'buy', 40, 58.00, 'day', 'executed', CURRENT_TIMESTAMP - INTERVAL '3 days', 2321.00),

-- ORDRES ANNULÉS (5)
('80000000-0000-0000-0000-000000000026'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, '60000000-0000-0000-0000-000000000007'::uuid, 'buy', 20, 160.00, 'day', 'cancelled', CURRENT_TIMESTAMP - INTERVAL '15 days', 3201.00),
('80000000-0000-0000-0000-000000000027'::uuid, '00000000-0000-4000-8000-000000000106'::uuid, '60000000-0000-0000-0000-000000000006'::uuid, 'sell', 30, 50.00, 'until_cancelled', 'cancelled', CURRENT_TIMESTAMP - INTERVAL '12 days', 1434.00),
('80000000-0000-0000-0000-000000000028'::uuid, '00000000-0000-4000-8000-000000000108'::uuid, '60000000-0000-0000-0000-000000000004'::uuid, 'buy', 10, 115.00, 'day', 'cancelled', CURRENT_TIMESTAMP - INTERVAL '8 days', 1151.00),
('80000000-0000-0000-0000-000000000029'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, '60000000-0000-0000-0000-000000000010'::uuid, 'buy', 15, 98.00, 'until_cancelled', 'cancelled', CURRENT_TIMESTAMP - INTERVAL '20 days', 1471.00),
('80000000-0000-0000-0000-000000000030'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, '60000000-0000-0000-0000-000000000003'::uuid, 'sell', 25, 76.00, 'day', 'cancelled', CURRENT_TIMESTAMP - INTERVAL '18 days', 1972.50);

-- =============================================================================
-- 10. SHARE TRANSACTIONS (5 transactions d'actions exécutées)
-- =============================================================================
INSERT INTO share_transactions (id, share_id, buy_order_id, sell_order_id, buyer_id, seller_id, price_executed, quantity, date_executed, buyer_fee, seller_fee) VALUES
-- Transaction 1 : Sophie achète 50 TechNova à Chloé à 104€
('90000000-0000-0000-0000-000000000001'::uuid, '60000000-0000-0000-0000-000000000001'::uuid, '80000000-0000-0000-0000-000000000021'::uuid, '80000000-0000-0000-0000-000000000022'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, 104.00, 50, CURRENT_TIMESTAMP - INTERVAL '10 days', 100, 100),

-- Transaction 2 : Alice achète 30 AutoDrive à Chloé à 90€
('90000000-0000-0000-0000-000000000002'::uuid, '60000000-0000-0000-0000-000000000005'::uuid, '80000000-0000-0000-0000-000000000023'::uuid, '80000000-0000-0000-0000-000000000024'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, 90.00, 30, CURRENT_TIMESTAMP - INTERVAL '5 days', 100, 100),

-- Transaction 3 : Paul achète 40 EcoConstruct (vendeur fictif pour créer position initiale)
('90000000-0000-0000-0000-000000000003'::uuid, '60000000-0000-0000-0000-000000000009'::uuid, '80000000-0000-0000-0000-000000000025'::uuid, '80000000-0000-0000-0000-000000000025'::uuid, '00000000-0000-4000-8000-000000000105'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, 58.00, 40, CURRENT_TIMESTAMP - INTERVAL '3 days', 100, 100);

-- =============================================================================
-- 11. CONVERSATIONS (12 conversations variées)
-- =============================================================================
INSERT INTO conversations (id, subject, status, type, date_ouverture, customer_id) VALUES
-- Conversations OUVERTES (6)
('A0000000-0000-0000-0000-000000000001'::uuid, 'Jean Martin • Marie Dupont', 'open', 'PRIVATE', CURRENT_TIMESTAMP - INTERVAL '2 days', '00000000-0000-4000-8000-000000000101'::uuid),
('A0000000-0000-0000-0000-000000000002'::uuid, 'Sophie Bernard • Pierre Moreau', 'open', 'PRIVATE', CURRENT_TIMESTAMP - INTERVAL '5 days', '00000000-0000-4000-8000-000000000102'::uuid),
('A0000000-0000-0000-0000-000000000003'::uuid, 'Luc Petit • Julie Laurent', 'open', 'PRIVATE', CURRENT_TIMESTAMP - INTERVAL '1 day', '00000000-0000-4000-8000-000000000103'::uuid),
('A0000000-0000-0000-0000-000000000004'::uuid, 'Alice Durand • Marc Simon', 'open', 'PRIVATE', CURRENT_TIMESTAMP - INTERVAL '3 hours', '00000000-0000-4000-8000-000000000104'::uuid),
('A0000000-0000-0000-0000-000000000005'::uuid, 'Paul Leroy • Émilie Michel', 'open', 'PRIVATE', CURRENT_TIMESTAMP - INTERVAL '7 days', '00000000-0000-4000-8000-000000000105'::uuid),
('A0000000-0000-0000-0000-000000000006'::uuid, 'Équipe', 'open', 'GROUP', CURRENT_TIMESTAMP - INTERVAL '10 days', NULL),

-- Conversations TRANSFÉRÉES (3)
('A0000000-0000-0000-0000-000000000007'::uuid, 'Hugo Lambert • Julie Laurent', 'transferred', 'PRIVATE', CURRENT_TIMESTAMP - INTERVAL '15 days', '00000000-0000-4000-8000-000000000107'::uuid),
('A0000000-0000-0000-0000-000000000008'::uuid, 'Léa Garcia • Émilie Michel', 'transferred', 'PRIVATE', CURRENT_TIMESTAMP - INTERVAL '20 days', '00000000-0000-4000-8000-000000000108'::uuid),
('A0000000-0000-0000-0000-000000000009'::uuid, 'Noah Fontaine • Émilie Michel', 'transferred', 'PRIVATE', CURRENT_TIMESTAMP - INTERVAL '12 days', '00000000-0000-4000-8000-000000000109'::uuid),

-- Conversations FERMÉES (3)
('A0000000-0000-0000-0000-000000000010'::uuid, 'Jean Martin • Marie Dupont', 'closed', 'PRIVATE', CURRENT_TIMESTAMP - INTERVAL '30 days', '00000000-0000-4000-8000-000000000101'::uuid),
('A0000000-0000-0000-0000-000000000011'::uuid, 'Chloé Chevalier • Julie Laurent', 'closed', 'PRIVATE', CURRENT_TIMESTAMP - INTERVAL '25 days', '00000000-0000-4000-8000-000000000110'::uuid),
('A0000000-0000-0000-0000-000000000012'::uuid, 'Alice Durand • Marc Simon', 'closed', 'PRIVATE', CURRENT_TIMESTAMP - INTERVAL '18 days', '00000000-0000-4000-8000-000000000104'::uuid);

-- =============================================================================
-- 12. MESSAGES (50+ messages dans les conversations)
-- =============================================================================
INSERT INTO messages (id, conversation_id, sender_id, sender_role, text, send_date) VALUES
-- Conversation 1 : Jean Martin (récente)
('B0000000-0000-0000-0000-000000000001'::uuid, 'A0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, 'customer', 'Bonjour, j''ai une question concernant mon crédit immobilier.', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('B0000000-0000-0000-0000-000000000002'::uuid, 'A0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-4000-8000-000000000011'::uuid, 'bankAdvisor', 'Bonjour Monsieur Martin, je suis Marie Dupont, votre conseillère. Comment puis-je vous aider ?', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '15 minutes'),
('B0000000-0000-0000-0000-000000000003'::uuid, 'A0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, 'customer', 'Est-il possible de rembourser mon crédit par anticipation ?', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '20 minutes'),
('B0000000-0000-0000-0000-000000000004'::uuid, 'A0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-4000-8000-000000000011'::uuid, 'bankAdvisor', 'Oui, tout à fait. Je vous envoie les informations par email. Y a-t-il autre chose ?', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '30 minutes'),

-- Conversation 2 : Sophie Bernard (question investissements)
('B0000000-0000-0000-0000-000000000005'::uuid, 'A0000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, 'customer', 'Bonjour, je souhaiterais avoir des conseils sur mes investissements en actions.', CURRENT_TIMESTAMP - INTERVAL '5 days'),
('B0000000-0000-0000-0000-000000000006'::uuid, 'A0000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-4000-8000-000000000012'::uuid, 'bankAdvisor', 'Bonjour Madame Bernard, Pierre Moreau à votre service. Quelle est votre question ?', CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '1 hour'),
('B0000000-0000-0000-0000-000000000007'::uuid, 'A0000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, 'customer', 'J''ai vu que TechNova Corp a beaucoup monté. Dois-je vendre une partie de mes actions ?', CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '1 hour 10 minutes'),
('B0000000-0000-0000-0000-000000000008'::uuid, 'A0000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-4000-8000-000000000012'::uuid, 'bankAdvisor', 'Cela dépend de votre stratégie. Si vous souhaitez sécuriser vos gains, c''est une option. Sinon, vous pouvez conserver en vue d''une croissance à long terme.', CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '1 hour 30 minutes'),
('B0000000-0000-0000-0000-000000000009'::uuid, 'A0000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-4000-8000-000000000102'::uuid, 'customer', 'Je vais réfléchir, merci pour vos conseils !', CURRENT_TIMESTAMP - INTERVAL '5 days' + INTERVAL '2 hours'),

-- Conversation 3 : Luc Petit (nouveau client)
('B0000000-0000-0000-0000-000000000010'::uuid, 'A0000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-4000-8000-000000000103'::uuid, 'customer', 'Bonjour, je viens d''ouvrir un compte chez vous et j''ai besoin d''aide pour configurer mes virements automatiques.', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('B0000000-0000-0000-0000-000000000011'::uuid, 'A0000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-4000-8000-000000000013'::uuid, 'bankAdvisor', 'Bonjour Monsieur Petit, c''est Julie Laurent. Je vais vous guider. Quels virements souhaitez-vous programmer ?', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '20 minutes'),
('B0000000-0000-0000-0000-000000000012'::uuid, 'A0000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-4000-8000-000000000103'::uuid, 'customer', 'Un virement mensuel de 200€ vers mon livret d''épargne.', CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '25 minutes'),

-- Conversation 4 : Alice Durand (très récente)
('B0000000-0000-0000-0000-000000000013'::uuid, 'A0000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, 'customer', 'Urgent : ma carte bancaire vient d''être refusée alors que j''ai du solde !', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
('B0000000-0000-0000-0000-000000000014'::uuid, 'A0000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-4000-8000-000000000014'::uuid, 'bankAdvisor', 'Bonjour Madame Durand, Marc Simon. Je vérifie immédiatement.', CURRENT_TIMESTAMP - INTERVAL '3 hours' + INTERVAL '5 minutes'),
('B0000000-0000-0000-0000-000000000015'::uuid, 'A0000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-4000-8000-000000000014'::uuid, 'bankAdvisor', 'Votre carte a été temporairement bloquée pour une raison de sécurité. Je la réactive immédiatement.', CURRENT_TIMESTAMP - INTERVAL '3 hours' + INTERVAL '10 minutes'),
('B0000000-0000-0000-0000-000000000016'::uuid, 'A0000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, 'customer', 'Merci beaucoup, c''est réglé !', CURRENT_TIMESTAMP - INTERVAL '3 hours' + INTERVAL '15 minutes'),

-- Conversation 5 : Paul Leroy (ancienne conversation)
('B0000000-0000-0000-0000-000000000017'::uuid, 'A0000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-4000-8000-000000000105'::uuid, 'customer', 'Bonjour, je voudrais des informations sur les taux de crédit immobilier actuels.', CURRENT_TIMESTAMP - INTERVAL '7 days'),
('B0000000-0000-0000-0000-000000000018'::uuid, 'A0000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-4000-8000-000000000015'::uuid, 'bankAdvisor', 'Bonjour Monsieur Leroy, Émilie Michel. Les taux actuels varient entre 3.5% et 4.5% selon la durée.', CURRENT_TIMESTAMP - INTERVAL '7 days' + INTERVAL '2 hours'),
('B0000000-0000-0000-0000-000000000019'::uuid, 'A0000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-4000-8000-000000000105'::uuid, 'customer', 'Merci, je vais y réfléchir et je reviendrai vers vous.', CURRENT_TIMESTAMP - INTERVAL '7 days' + INTERVAL '2 hours 30 minutes'),

-- Conversation 6 : Équipe (conversation de groupe)
('B0000000-0000-0000-0000-000000000020'::uuid, 'A0000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-4000-8000-000000000001'::uuid, 'bankManager', 'Bonjour à tous, point rapide : dossier investissement complexe à traiter aujourd''hui.', CURRENT_TIMESTAMP - INTERVAL '10 days'),
('B0000000-0000-0000-0000-000000000021'::uuid, 'A0000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-4000-8000-000000000012'::uuid, 'bankAdvisor', 'Je peux prendre le dossier. Besoin d''un avis expert pour valider la stratégie.', CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '1 hour'),
('B0000000-0000-0000-0000-000000000022'::uuid, 'A0000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-4000-8000-000000000014'::uuid, 'bankAdvisor', 'Je suis dispo pour aider sur la partie marchés actions / diversification.', CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '1 hour 30 minutes'),
('B0000000-0000-0000-0000-000000000023'::uuid, 'A0000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-4000-8000-000000000001'::uuid, 'bankManager', 'Parfait. Merci, tenez-moi au courant ici.', CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '2 hours'),

-- Conversation 7 : Hugo Lambert (transférée)
('B0000000-0000-0000-0000-000000000024'::uuid, 'A0000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-4000-8000-000000000107'::uuid, 'customer', 'J''ai un problème avec mon découvert autorisé.', CURRENT_TIMESTAMP - INTERVAL '15 days'),
('B0000000-0000-0000-0000-000000000025'::uuid, 'A0000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-4000-8000-000000000011'::uuid, 'bankAdvisor', 'Je transfère votre demande à un collègue spécialisé.', CURRENT_TIMESTAMP - INTERVAL '15 days' + INTERVAL '30 minutes'),
('B0000000-0000-0000-0000-000000000026'::uuid, 'A0000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-4000-8000-000000000013'::uuid, 'bankAdvisor', 'Bonjour, Julie Laurent. J''ai pris connaissance de votre dossier.', CURRENT_TIMESTAMP - INTERVAL '14 days' + INTERVAL '2 hours'),

-- Conversation 8 : Léa Garcia (transférée)
('B0000000-0000-0000-0000-000000000027'::uuid, 'A0000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-4000-8000-000000000108'::uuid, 'customer', 'Question sur les frais de transactions boursières.', CURRENT_TIMESTAMP - INTERVAL '20 days'),
('B0000000-0000-0000-0000-000000000028'::uuid, 'A0000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-4000-8000-000000000012'::uuid, 'bankAdvisor', 'Les frais sont de 1€ par transaction.', CURRENT_TIMESTAMP - INTERVAL '20 days' + INTERVAL '1 hour'),

-- Conversation 9 : Noah Fontaine (transférée)
('B0000000-0000-0000-0000-000000000029'::uuid, 'A0000000-0000-0000-0000-000000000009'::uuid, '00000000-0000-4000-8000-000000000109'::uuid, 'customer', 'Je souhaite ouvrir un compte épargne.', CURRENT_TIMESTAMP - INTERVAL '12 days'),
('B0000000-0000-0000-0000-000000000030'::uuid, 'A0000000-0000-0000-0000-000000000009'::uuid, '00000000-0000-4000-8000-000000000015'::uuid, 'bankAdvisor', 'Parfait, je m''occupe de votre demande.', CURRENT_TIMESTAMP - INTERVAL '12 days' + INTERVAL '3 hours'),

-- Conversation 10 : Jean Martin (fermée - ancienne)
('B0000000-0000-0000-0000-000000000031'::uuid, 'A0000000-0000-0000-0000-000000000010'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, 'customer', 'Demande d''information sur les comptes épargne.', CURRENT_TIMESTAMP - INTERVAL '30 days'),
('B0000000-0000-0000-0000-000000000032'::uuid, 'A0000000-0000-0000-0000-000000000010'::uuid, '00000000-0000-4000-8000-000000000011'::uuid, 'bankAdvisor', 'Voici la documentation complète.', CURRENT_TIMESTAMP - INTERVAL '30 days' + INTERVAL '1 hour'),
('B0000000-0000-0000-0000-000000000033'::uuid, 'A0000000-0000-0000-0000-000000000010'::uuid, '00000000-0000-4000-8000-000000000101'::uuid, 'customer', 'Merci, c''est parfait !', CURRENT_TIMESTAMP - INTERVAL '30 days' + INTERVAL '2 hours'),

-- Conversation 11 : Chloé Chevalier (fermée)
('B0000000-0000-0000-0000-000000000034'::uuid, 'A0000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-4000-8000-000000000110'::uuid, 'customer', 'Problème résolu, merci !', CURRENT_TIMESTAMP - INTERVAL '25 days'),

-- Conversation 12 : Alice Durand (fermée)
('B0000000-0000-0000-0000-000000000035'::uuid, 'A0000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-4000-8000-000000000104'::uuid, 'customer', 'Question sur mon relevé de compte.', CURRENT_TIMESTAMP - INTERVAL '18 days'),
('B0000000-0000-0000-0000-000000000036'::uuid, 'A0000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-4000-8000-000000000014'::uuid, 'bankAdvisor', 'Tout est en ordre, votre relevé est correct.', CURRENT_TIMESTAMP - INTERVAL '18 days' + INTERVAL '30 minutes');

-- =============================================================================
-- 13. PARTICIPANT CONVERSATIONS (Attribution des conseillers aux conversations)
-- =============================================================================
INSERT INTO participant_conversations (id, conversation_id, advisor_id, date_added, date_end, est_principal) VALUES
-- Conversations ouvertes
('C0000000-0000-0000-0000-000000000001'::uuid, 'A0000000-0000-0000-0000-000000000001'::uuid, '00000000-0000-4000-8000-000000000011'::uuid, CURRENT_TIMESTAMP - INTERVAL '2 days', NULL, true),
('C0000000-0000-0000-0000-000000000002'::uuid, 'A0000000-0000-0000-0000-000000000002'::uuid, '00000000-0000-4000-8000-000000000012'::uuid, CURRENT_TIMESTAMP - INTERVAL '5 days', NULL, true),
('C0000000-0000-0000-0000-000000000003'::uuid, 'A0000000-0000-0000-0000-000000000003'::uuid, '00000000-0000-4000-8000-000000000013'::uuid, CURRENT_TIMESTAMP - INTERVAL '1 day', NULL, true),
('C0000000-0000-0000-0000-000000000004'::uuid, 'A0000000-0000-0000-0000-000000000004'::uuid, '00000000-0000-4000-8000-000000000014'::uuid, CURRENT_TIMESTAMP - INTERVAL '3 hours', NULL, true),
('C0000000-0000-0000-0000-000000000005'::uuid, 'A0000000-0000-0000-0000-000000000005'::uuid, '00000000-0000-4000-8000-000000000015'::uuid, CURRENT_TIMESTAMP - INTERVAL '7 days', NULL, true),

-- Conversation de groupe (tous les conseillers + directeur)
('C0000000-0000-0000-0000-000000000006'::uuid, 'A0000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-4000-8000-000000000012'::uuid, CURRENT_TIMESTAMP - INTERVAL '10 days', NULL, true),
('C0000000-0000-0000-0000-000000000007'::uuid, 'A0000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-4000-8000-000000000014'::uuid, CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '1 hour 30 minutes', NULL, false),
('C0000000-0000-0000-0000-000000000018'::uuid, 'A0000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-4000-8000-000000000011'::uuid, CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '2 hours', NULL, false),
('C0000000-0000-0000-0000-000000000019'::uuid, 'A0000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-4000-8000-000000000013'::uuid, CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '2 hours 30 minutes', NULL, false),
('C0000000-0000-0000-0000-000000000020'::uuid, 'A0000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-4000-8000-000000000015'::uuid, CURRENT_TIMESTAMP - INTERVAL '10 days' + INTERVAL '3 hours', NULL, false),
('C0000000-0000-0000-0000-000000000017'::uuid, 'A0000000-0000-0000-0000-000000000006'::uuid, '00000000-0000-4000-8000-000000000001'::uuid, CURRENT_TIMESTAMP - INTERVAL '10 days', NULL, false),

-- Conversations transférées (ancien + nouveau conseiller)
('C0000000-0000-0000-0000-000000000008'::uuid, 'A0000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-4000-8000-000000000011'::uuid, CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '14 days' + INTERVAL '2 hours', true),
('C0000000-0000-0000-0000-000000000009'::uuid, 'A0000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-4000-8000-000000000013'::uuid, CURRENT_TIMESTAMP - INTERVAL '14 days' + INTERVAL '2 hours', NULL, true),

('C0000000-0000-0000-0000-000000000010'::uuid, 'A0000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-4000-8000-000000000012'::uuid, CURRENT_TIMESTAMP - INTERVAL '20 days', CURRENT_TIMESTAMP - INTERVAL '19 days', true),
('C0000000-0000-0000-0000-000000000011'::uuid, 'A0000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-4000-8000-000000000015'::uuid, CURRENT_TIMESTAMP - INTERVAL '19 days', NULL, true),

('C0000000-0000-0000-0000-000000000012'::uuid, 'A0000000-0000-0000-0000-000000000009'::uuid, '00000000-0000-4000-8000-000000000011'::uuid, CURRENT_TIMESTAMP - INTERVAL '12 days', CURRENT_TIMESTAMP - INTERVAL '11 days' + INTERVAL '3 hours', true),
('C0000000-0000-0000-0000-000000000013'::uuid, 'A0000000-0000-0000-0000-000000000009'::uuid, '00000000-0000-4000-8000-000000000015'::uuid, CURRENT_TIMESTAMP - INTERVAL '11 days' + INTERVAL '3 hours', NULL, true),

-- Conversations fermées
('C0000000-0000-0000-0000-000000000014'::uuid, 'A0000000-0000-0000-0000-000000000010'::uuid, '00000000-0000-4000-8000-000000000011'::uuid, CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP - INTERVAL '30 days' + INTERVAL '3 hours', true),
('C0000000-0000-0000-0000-000000000015'::uuid, 'A0000000-0000-0000-0000-000000000011'::uuid, '00000000-0000-4000-8000-000000000013'::uuid, CURRENT_TIMESTAMP - INTERVAL '25 days', CURRENT_TIMESTAMP - INTERVAL '25 days' + INTERVAL '1 hour', true),
('C0000000-0000-0000-0000-000000000016'::uuid, 'A0000000-0000-0000-0000-000000000012'::uuid, '00000000-0000-4000-8000-000000000014'::uuid, CURRENT_TIMESTAMP - INTERVAL '18 days', CURRENT_TIMESTAMP - INTERVAL '18 days' + INTERVAL '1 hour', true);

-- =============================================================================
-- 14. TRANSFER CONVERSATIONS (Historique des transferts entre conseillers)
-- =============================================================================
INSERT INTO transfer_conversations (id, conversation_id, from_advisor_id, to_advisor_id, reason, transfer_date) VALUES
('D0000000-0000-0000-0000-000000000001'::uuid, 'A0000000-0000-0000-0000-000000000007'::uuid, '00000000-0000-4000-8000-000000000011'::uuid, '00000000-0000-4000-8000-000000000013'::uuid, 'Transfert pour spécialisation en gestion de découvert', CURRENT_TIMESTAMP - INTERVAL '14 days' + INTERVAL '2 hours'),
('D0000000-0000-0000-0000-000000000002'::uuid, 'A0000000-0000-0000-0000-000000000008'::uuid, '00000000-0000-4000-8000-000000000012'::uuid, '00000000-0000-4000-8000-000000000015'::uuid, 'Transfert pour spécialisation en investissements boursiers', CURRENT_TIMESTAMP - INTERVAL '19 days'),
('D0000000-0000-0000-0000-000000000003'::uuid, 'A0000000-0000-0000-0000-000000000009'::uuid, '00000000-0000-4000-8000-000000000011'::uuid, '00000000-0000-4000-8000-000000000015'::uuid, 'Client souhaite un conseiller différent', CURRENT_TIMESTAMP - INTERVAL '11 days' + INTERVAL '3 hours');

-- =============================================================================
-- END OF INITIALIZATION
-- =============================================================================
