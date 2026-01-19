# SnapFlow - Complete Database Setup

This directory contains all database schemas and setup scripts for SnapFlow.

## 📁 Structure

```
database/
├── README.md                          # This file
├── postgresql/
│   ├── 01_init_database.sql          # Create databases and users
│   ├── 02_flowable_schema.sql        # Flowable tables (auto-generated)
│   ├── 03_snapflow_core.sql          # Core SnapFlow tables
│   ├── 04_rules_engine.sql           # Rules Engine tables
│   ├── 05_forms.sql                  # Forms tables
│   ├── 06_sample_data.sql            # Sample/demo data
│   └── setup.sh                      # Automated setup script
├── mongodb/
│   ├── init.js                       # MongoDB initialization
│   ├── collections.js                # Collection schemas
│   └── sample_data.js                # Sample data
└── docker/
    └── docker-compose.yml            # Complete stack with Docker
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)
```bash
cd database/docker
docker-compose up -d
```

### Option 2: Manual Setup
```bash
cd database/postgresql
./setup.sh
```

## 📊 Databases

### PostgreSQL
- **snapflow** - Main application database
  - Workflows, versions, deployments
  - Users, teams, permissions
  - Rules engine
  - Forms
  - Audit logs

### MongoDB (Optional)
- **snapflow** - Real-time data
  - Comments & mentions
  - Activity feed
  - Notifications
  - User sessions

## 🔧 Configuration

After setup, update your application configuration:

**Backend (`application.yml`):**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/snapflow
    username: snapflow_user
    password: snapflow_pass
  
  data:
    mongodb:
      uri: mongodb://localhost:27017/snapflow
```

**Frontend (`.env`):**
```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 📝 Schema Overview

### Core Tables
- `workflows` - Workflow definitions
- `workflow_versions` - Version history
- `users` - User accounts
- `teams` - Team/workspace management

### Rules Engine
- `rule_sets` - Rule collections
- `rules` - Individual rules (JSONB)
- `rule_executions` - Audit trail

### Forms
- `forms` - Form definitions (JSONB)
- `form_submissions` - User submissions

### Flowable (Auto-created)
- `ACT_*` - Flowable process engine tables

## 🔄 Migrations

We use Flyway for database migrations:
- Migrations are in `src/main/resources/db/migration/`
- Naming: `V{version}__{description}.sql`
- Auto-applied on application startup

## 🧪 Sample Data

Sample data includes:
- 3 demo workflows
- 5 demo users
- 2 rule sets with rules
- 3 form templates

To load sample data:
```bash
psql -U snapflow_user -d snapflow -f postgresql/06_sample_data.sql
```

## 📚 Documentation

See `/docs` folder for:
- Complete schema documentation
- API documentation
- Setup guides
- Architecture diagrams
