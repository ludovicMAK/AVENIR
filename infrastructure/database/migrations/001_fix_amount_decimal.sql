-- Migration: Fix amount columns to support decimal values
-- Date: 2026-01-07
-- Description: Change amount columns from INTEGER to NUMERIC to support decimal amounts

-- Modify transfers table
ALTER TABLE transfers 
ALTER COLUMN amount TYPE NUMERIC(10, 2);

-- Modify transactions table
ALTER TABLE transactions 
ALTER COLUMN amount TYPE NUMERIC(10, 2);

-- Note: NUMERIC(10, 2) allows values up to 99,999,999.99
