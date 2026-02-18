-- Migration: 001_init_schema.sql
-- Purpose: create initial PostgreSQL schema for Authentication-System-for-Genuine-Goods
-- Run with: psql -h localhost -U postgres -d authentication_system -f 001_init_schema.sql

BEGIN;

-- Create enum product_status if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
    CREATE TYPE product_status AS ENUM ('manufactured','with_seller','sold_to_consumer');
  END IF;
END$$;

-- Create enum product_event_type if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_event_type') THEN
    CREATE TYPE product_event_type AS ENUM ('added','sold_to_seller','sold_to_consumer');
  END IF;
END$$;

-- manufacturers table (maps to /m_signup, /m_signin and brand lookup)
CREATE TABLE IF NOT EXISTS manufacturer (
  manuf_id TEXT PRIMARY KEY,
  manuf_brand TEXT UNIQUE NOT NULL,
  manuf_city TEXT,
  pass TEXT NOT NULL,
  contract_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- sellers table (maps to /s_signup, /s_signin)
CREATE TABLE IF NOT EXISTS seller (
  seller_id TEXT PRIMARY KEY,
  seller_name TEXT,
  seller_city TEXT,
  pass TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- customers table (optional; used when selling to consumers)
CREATE TABLE IF NOT EXISTS customer (
  email TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- products table: unique per manufacturer brand + product_id (QR uses brand + product_id)
CREATE TABLE IF NOT EXISTS product (
  id BIGSERIAL PRIMARY KEY,
  manufacturer_brand TEXT NOT NULL REFERENCES manufacturer(manuf_brand) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  name TEXT,
  price NUMERIC(12,2),
  qr_data TEXT,
  status product_status NOT NULL DEFAULT 'manufactured',
  current_owner_type TEXT,
  current_owner_id TEXT,
  consumer_email TEXT,
  consumer_code_hash TEXT,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (manufacturer_brand, product_id)
);

-- manufacturer -> seller relation (manufacturer.addSellers bookkeeping)
CREATE TABLE IF NOT EXISTS manufacturer_seller (
  manuf_id TEXT REFERENCES manufacturer(manuf_id) ON DELETE CASCADE,
  seller_id TEXT REFERENCES seller(seller_id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (manuf_id, seller_id)
);

-- product_event: audit/history of actions on a product
CREATE TABLE IF NOT EXISTS product_event (
  id BIGSERIAL PRIMARY KEY,
  product_id BIGINT REFERENCES product(id) ON DELETE CASCADE,
  event_type product_event_type NOT NULL,
  from_type TEXT,
  from_id TEXT,
  to_type TEXT,
  to_id TEXT,
  consumer_email TEXT,
  consumer_code_hash TEXT,
  tx_hash TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_manufacturer_brand ON product (manufacturer_brand);
CREATE INDEX IF NOT EXISTS idx_product_event_product_id ON product_event (product_id);

COMMIT;

-- Notes:
-- 1) The migration uses guarded DO blocks for enum creation so it is safe to re-run.
-- 2) For security, store only a hashed consumer code in `consumer_code_hash` (do NOT store plaintext codes).
-- 3) To apply this migration from the server/migrations folder using PowerShell:
--    $env:PGPASSWORD = "rohan123"; psql -h localhost -U postgres -d authentication_system -f .\migrations\001_init_schema.sql; Remove-Item Env:PGPASSWORD

