-- SnapFlow Database Initialization
-- Database 'snapflow' is already created by POSTGRES_DB env var.
-- Owner 'snapflow' is already created by POSTGRES_USER env var.

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

SELECT 'SnapFlow database initialized successfully!' AS status;
