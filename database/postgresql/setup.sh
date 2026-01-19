#!/bin/bash

# SnapFlow Database Setup Script
# This script sets up the complete SnapFlow database from scratch

set -e  # Exit on error

echo "========================================="
echo "SnapFlow Database Setup"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="snapflow"
DB_USER="snapflow_user"
DB_PASS="snapflow_pass"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

echo "Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Check if PostgreSQL is running
echo -n "Checking PostgreSQL connection... "
if pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Error: PostgreSQL is not running or not accessible"
    echo "Please start PostgreSQL and try again"
    exit 1
fi

# Function to run SQL file
run_sql() {
    local file=$1
    local description=$2
    
    echo -n "Running: $description... "
    if PGPASSWORD=$POSTGRES_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $POSTGRES_USER -f "$file" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        echo "Error running $file"
        exit 1
    fi
}

# Ask for confirmation
echo -e "${YELLOW}Warning: This will create/recreate the SnapFlow database.${NC}"
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Setting up database..."
echo ""

# Run setup scripts in order
run_sql "01_init_database.sql" "Initialize database and user"
run_sql "03_snapflow_core.sql" "Create core schema"
run_sql "04_rules_engine.sql" "Create rules engine schema"
run_sql "05_forms.sql" "Create forms schema"
run_sql "06_sample_data.sql" "Load sample data"

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Database setup complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Connection details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  Username: $DB_USER"
echo "  Password: $DB_PASS"
echo ""
echo "Update your application.yml with:"
echo ""
echo "spring:"
echo "  datasource:"
echo "    url: jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME"
echo "    username: $DB_USER"
echo "    password: $DB_PASS"
echo ""
echo -e "${GREEN}Ready to start SnapFlow!${NC}"
