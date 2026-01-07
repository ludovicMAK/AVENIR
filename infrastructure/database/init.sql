-- AVENIR Banking Application - Database Schema
-- PostgreSQL 16

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstname VARCHAR(255) NOT NULL,
    lastname VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL,
    email_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email confirmation tokens table
CREATE TABLE IF NOT EXISTS email_confirmation_tokens (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(255) PRIMARY KEY,
    account_type VARCHAR(50) NOT NULL,
    iban VARCHAR(34) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    authorized_overdraft BOOLEAN DEFAULT FALSE,
    overdraft_limit DECIMAL(15, 2) DEFAULT 0,
    overdraft_fees DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) NOT NULL,
    id_owner VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) DEFAULT 0,
    available_balance DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shares table
CREATE TABLE IF NOT EXISTS shares (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    total_number_of_parts INTEGER NOT NULL,
    last_executed_price DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_id VARCHAR(255) NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('BUY', 'SELL')),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_limit DECIMAL(15, 2) NOT NULL CHECK (price_limit > 0),
    validity VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('ACTIVE', 'EXECUTED', 'CANCELLED')),
    date_captured TIMESTAMP NOT NULL,
    blocked_amount DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_orders_share_status (share_id, status),
    INDEX idx_orders_customer (customer_id),
    INDEX idx_orders_direction (direction)
);

-- Share transactions table
CREATE TABLE IF NOT EXISTS share_transactions (
    id VARCHAR(255) PRIMARY KEY,
    share_id VARCHAR(255) NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
    buy_order_id VARCHAR(255) NOT NULL REFERENCES orders(id),
    sell_order_id VARCHAR(255) NOT NULL REFERENCES orders(id),
    buyer_id VARCHAR(255) NOT NULL REFERENCES users(id),
    seller_id VARCHAR(255) NOT NULL REFERENCES users(id),
    price_executed DECIMAL(15, 2) NOT NULL CHECK (price_executed > 0),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    date_executed TIMESTAMP NOT NULL,
    buyer_fee DECIMAL(15, 2) DEFAULT 100,
    seller_fee DECIMAL(15, 2) DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_share_transactions_share (share_id),
    INDEX idx_share_transactions_date (date_executed)
);

-- Securities positions table
CREATE TABLE IF NOT EXISTS securities_positions (
    id VARCHAR(255) PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_id VARCHAR(255) NOT NULL REFERENCES shares(id) ON DELETE CASCADE,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    blocked_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, share_id),
    INDEX idx_securities_positions_customer (customer_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(255) PRIMARY KEY,
    date_time TIMESTAMP NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('DEBIT', 'CREDIT')),
    status VARCHAR(50) NOT NULL,
    account_id VARCHAR(255) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    transfer_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_transactions_account (account_id),
    INDEX idx_transactions_date (date_time)
);

-- Transfers table
CREATE TABLE IF NOT EXISTS transfers (
    id VARCHAR(255) PRIMARY KEY,
    emitter_account_id VARCHAR(255) NOT NULL REFERENCES accounts(id),
    receiver_account_id VARCHAR(255) NOT NULL REFERENCES accounts(id),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_transfers_status (status)
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    subject VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(255) PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id VARCHAR(255) NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    date_sent TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_messages_conversation (conversation_id),
    INDEX idx_messages_date (date_sent)
);

-- Participant conversations table
CREATE TABLE IF NOT EXISTS participant_conversations (
    id VARCHAR(255) PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, user_id),
    INDEX idx_participant_conversations_user (user_id)
);

-- Transfer conversations table
CREATE TABLE IF NOT EXISTS transfer_conversations (
    id VARCHAR(255) PRIMARY KEY,
    conversation_id VARCHAR(255) NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    from_advisor_id VARCHAR(255) NOT NULL REFERENCES users(id),
    to_advisor_id VARCHAR(255) NOT NULL REFERENCES users(id),
    transfer_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_transfer_conversations_conversation (conversation_id)
);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, email, password, firstname, lastname, role, email_confirmed)
VALUES (
    'admin-001',
    'admin@avenir.com',
    '$2b$10$rBV2kTgJZxUhVv9L9pZMQe5XBV7wZ5F0eV9X9X9X9X9X9X9X9X9Xu',
    'Admin',
    'System',
    'ADMIN',
    true
)
ON CONFLICT (email) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_accounts_owner ON accounts(id_owner);
CREATE INDEX IF NOT EXISTS idx_accounts_iban ON accounts(iban);
