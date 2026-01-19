-- SnapFlow Database Initialization
-- This script creates the database, user, and sets up permissions

-- Create database
CREATE DATABASE snapflow
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_US.UTF-8'
    LC_CTYPE = 'en_US.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Create user
CREATE USER snapflow_user WITH PASSWORD 'snapflow_pass';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE snapflow TO snapflow_user;

-- Connect to snapflow database
\c snapflow

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO snapflow_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO snapflow_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO snapflow_user;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSONB functions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO snapflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO snapflow_user;

-- Success message
SELECT 'SnapFlow database initialized successfully!' AS status;
