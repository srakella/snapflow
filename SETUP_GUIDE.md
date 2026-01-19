# SnapFlow - Complete Setup Guide

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Docker & Docker Compose (recommended)
- OR PostgreSQL 14+ (manual setup)
- Java 17+
- Node.js 18+

### Option 1: Docker Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourorg/snapflow.git
cd snapflow

# Start all services
cd database/docker
docker-compose up -d

# Wait for services to be healthy (30 seconds)
docker-compose ps

# Verify database
docker exec -it snapflow-postgres psql -U snapflow_user -d snapflow -c "\dt"
```

**That's it!** Database is ready with sample data.

### Option 2: Manual Setup

```bash
# 1. Install PostgreSQL 14+
# macOS:
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian:
sudo apt-get install postgresql-16

# 2. Run setup script
cd database/postgresql
chmod +x setup.sh
./setup.sh

# 3. Verify
psql -U snapflow_user -d snapflow -c "\dt"
```

---

## 📦 What Gets Installed

### Databases
- **PostgreSQL** (port 5432)
  - Database: `snapflow`
  - User: `snapflow_user`
  - Password: `snapflow_pass`

- **MongoDB** (port 27017) - Optional
  - Database: `snapflow`
  - User: `snapflow`
  - Password: `snapflow_pass`

- **Redis** (port 6379) - Optional
  - For caching

### Tools
- **pgAdmin** (port 5050) - Optional
  - Email: admin@snapflow.local
  - Password: admin

---

## 🗄️ Database Schema

### Core Tables (PostgreSQL)

**Users & Teams:**
- `users` - User accounts
- `teams` - Team/workspace management
- `team_members` - Team membership

**Workflows:**
- `workflows` - Workflow definitions
- `workflow_versions` - Version history (JSONB)
- `workflow_deployments` - Deployment tracking
- `workflow_instances` - Runtime instances

**Rules Engine:**
- `rule_sets` - Rule collections
- `rules` - Individual rules (JSONB)
- `rule_executions` - Audit trail

**Forms:**
- `forms` - Form definitions (JSONB)
- `form_submissions` - User submissions

**Audit:**
- `audit_log` - Complete audit trail

### Sample Data Included

**5 Demo Users:**
- admin@snapflow.demo (admin)
- john.doe@snapflow.demo (user)
- jane.smith@snapflow.demo (user)
- mike.johnson@snapflow.demo (user)
- sarah.chen@snapflow.demo (user)

**2 Teams:**
- Engineering
- Finance

**3 Workflows:**
- Loan Approval Process (active)
- Employee Onboarding (active)
- Expense Approval (draft)

**3 Rule Sets:**
- Loan Approval Rules (3 rules)
- Discount Calculation (2 rules)
- Regional Routing (draft)

**1 Form:**
- Loan Application Form

---

## ⚙️ Application Configuration

### Backend (Spring Boot)

**`application.yml`:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/snapflow
    username: snapflow_user
    password: snapflow_pass
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: validate  # Use Flyway for migrations
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
        format_sql: true
  
  # Optional: MongoDB
  data:
    mongodb:
      uri: mongodb://snapflow:snapflow_pass@localhost:27017/snapflow
  
  # Optional: Redis
  redis:
    host: localhost
    port: 6379
  
  cache:
    type: redis  # or 'simple' for in-memory
    cache-names:
      - ruleSets
      - workflows

# Flowable
flowable:
  database-schema-update: true
  async-executor-activate: true
```

### Frontend (Next.js)

**`.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

---

## 🧪 Testing the Setup

### 1. Test Database Connection

```bash
# PostgreSQL
psql -U snapflow_user -d snapflow -c "SELECT COUNT(*) FROM users;"

# Expected output: 5 users
```

### 2. Test Sample Data

```bash
# Check workflows
psql -U snapflow_user -d snapflow -c "SELECT name, status FROM workflows;"

# Check rules
psql -U snapflow_user -d snapflow -c "SELECT name, priority FROM rules ORDER BY priority DESC;"
```

### 3. Start Backend

```bash
cd snapflow-engine
./gradlew bootRun

# Should see:
# - Flyway migrations applied
# - Flowable engine started
# - Application running on port 8080
```

### 4. Test API

```bash
# Get all rule sets
curl http://localhost:8080/api/rules/rule-sets

# Evaluate loan approval rules
curl -X POST http://localhost:8080/api/rules/rule-sets/{id}/evaluate \
  -H "Content-Type: application/json" \
  -d '{
    "creditScore": 720,
    "income": 60000,
    "debtRatio": 0.3
  }'

# Expected response:
# {
#   "decision": "APPROVED",
#   "reason": "Auto-approved: High credit score and income"
# }
```

### 5. Start Frontend

```bash
cd snapflow-designer
npm install
npm run dev

# Open http://localhost:3000
```

---

## 🔧 Troubleshooting

### PostgreSQL Connection Failed

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# If not running (macOS):
brew services start postgresql@16

# If not running (Ubuntu):
sudo systemctl start postgresql
```

### Database Already Exists

```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE IF EXISTS snapflow;"
psql -U postgres -c "DROP USER IF EXISTS snapflow_user;"

# Run setup again
cd database/postgresql
./setup.sh
```

### Docker Issues

```bash
# Stop all containers
docker-compose down

# Remove volumes (WARNING: deletes data)
docker-compose down -v

# Start fresh
docker-compose up -d

# View logs
docker-compose logs -f postgres
```

### Flyway Migration Errors

```bash
# Check migration status
./gradlew flywayInfo

# Repair if needed
./gradlew flywayRepair

# Clean and migrate (WARNING: deletes data)
./gradlew flywayClean flywayMigrate
```

---

## 📊 Database Management

### Backup

```bash
# Full backup
pg_dump -U snapflow_user -d snapflow > snapflow_backup.sql

# Schema only
pg_dump -U snapflow_user -d snapflow --schema-only > snapflow_schema.sql

# Data only
pg_dump -U snapflow_user -d snapflow --data-only > snapflow_data.sql
```

### Restore

```bash
# Restore from backup
psql -U snapflow_user -d snapflow < snapflow_backup.sql
```

### Reset to Sample Data

```bash
# Drop all data
psql -U snapflow_user -d snapflow -c "TRUNCATE users, teams, workflows, rules, forms CASCADE;"

# Reload sample data
psql -U snapflow_user -d snapflow -f database/postgresql/06_sample_data.sql
```

---

## 🚀 Production Deployment

### Environment Variables

```bash
# PostgreSQL
export DB_HOST=your-postgres-host
export DB_PORT=5432
export DB_NAME=snapflow
export DB_USER=snapflow_user
export DB_PASS=your-secure-password

# MongoDB (optional)
export MONGODB_URI=mongodb://user:pass@host:27017/snapflow

# Redis (optional)
export REDIS_HOST=your-redis-host
export REDIS_PORT=6379
```

### Security Checklist

- [ ] Change default passwords
- [ ] Use SSL/TLS for database connections
- [ ] Enable PostgreSQL authentication (pg_hba.conf)
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Use environment variables for secrets
- [ ] Enable audit logging
- [ ] Set up monitoring

### Recommended Production Setup

**Database:**
- PostgreSQL 16+ with replication
- Connection pooling (PgBouncer)
- Regular backups (pg_basebackup)
- Monitoring (pg_stat_statements)

**Caching:**
- Redis cluster for high availability
- Separate cache for sessions and data

**Monitoring:**
- PostgreSQL: pg_stat_monitor
- Application: Spring Boot Actuator
- Logs: ELK stack or similar

---

## 📚 Additional Resources

**Documentation:**
- `/docs/DATABASE_SCHEMA.md` - Complete schema documentation
- `/docs/API.md` - REST API documentation
- `/docs/ARCHITECTURE.md` - System architecture

**Database Tools:**
- pgAdmin: http://localhost:5050
- DBeaver: https://dbeaver.io/
- TablePlus: https://tableplus.com/

**Support:**
- GitHub Issues: https://github.com/yourorg/snapflow/issues
- Documentation: https://docs.snapflow.io

---

## ✅ Setup Complete!

Your SnapFlow environment is ready:

1. ✅ PostgreSQL database with schema
2. ✅ Sample data loaded
3. ✅ MongoDB configured (optional)
4. ✅ Redis configured (optional)
5. ✅ pgAdmin available (optional)

**Next steps:**
1. Start the backend: `cd snapflow-engine && ./gradlew bootRun`
2. Start the frontend: `cd snapflow-designer && npm run dev`
3. Open http://localhost:3000
4. Login with: admin@snapflow.demo

🎉 **Happy workflow building!**
