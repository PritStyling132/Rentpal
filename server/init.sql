-- Initial database setup for RentPal
-- This file runs automatically when the PostgreSQL container starts for the first time

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE rentpal TO rentpal_user;

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE 'RentPal database initialized successfully';
END $$;
