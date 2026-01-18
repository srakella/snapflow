# SnapFlow Quick Start Guide

## 🚀 Starting the Environment

To start all SnapFlow components (databases, backend, frontend):

```bash
./start-snapflow.sh
```

This will:
1. ✅ Check and start Docker if needed
2. ✅ Start PostgreSQL and MongoDB containers
3. ✅ Start the SnapFlow Engine (backend on port 8081)
4. ✅ Start the SnapFlow Designer (frontend on port 3000)
5. ✅ Open your browser to http://localhost:3000

**Wait time:** Approximately 30-60 seconds for all components to be ready.

## 🛑 Stopping the Environment

To stop all SnapFlow components:

```bash
./stop-snapflow.sh
```

This will gracefully shut down all services and clean up processes.

## 📊 Checking Status

To check the status of all components:

```bash
./status-snapflow.sh
```

This will show you which services are running and their health status.

## 📊 Services

Once started, you can access:

- **Frontend (Designer):** http://localhost:3000
- **Backend (Engine):** http://localhost:8081
- **PostgreSQL:** localhost:5432 (user: snapflow, password: snapflow)
- **MongoDB:** localhost:27017

## 📝 Logs

Application logs are stored in the `logs/` directory:

- `logs/engine.log` - Backend logs
- `logs/designer.log` - Frontend logs

To view logs in real-time:

```bash
# Backend logs
tail -f logs/engine.log

# Frontend logs
tail -f logs/designer.log
```

## 🔧 Troubleshooting

### Docker not starting
If Docker fails to start automatically, manually open Docker Desktop and wait for it to be ready, then run the start script again.

### Port already in use
If you see port conflicts:
- Frontend (3000): Check for other Next.js apps running
- Backend (8081): Check for other Spring Boot apps running
- PostgreSQL (5432): Check for other PostgreSQL instances
- MongoDB (27017): Check for other MongoDB instances

Use `lsof -i :<port>` to find what's using a port.

### Services not starting
Check the logs in the `logs/` directory for detailed error messages.

## 🔄 Restarting a Single Component

If you need to restart just one component:

```bash
# Restart backend only
cd snapflow-engine
gradle bootRun

# Restart frontend only
cd snapflow-designer
npm run dev
```

## 📦 Database Management

To reset databases (WARNING: This deletes all data):

```bash
docker stop snapflow-postgres snapflow-mongodb
docker rm snapflow-postgres snapflow-mongodb
docker volume rm workspace_postgres_data workspace_mongodb_data
./start-snapflow.sh
```

## 🎯 First Time Setup

If this is your first time running SnapFlow:

1. Ensure Docker Desktop is installed
2. Ensure Node.js (v18+) is installed
3. Ensure Java 17+ is installed
4. Ensure Gradle is installed
5. Run `./start-snapflow.sh`

---

**Note:** The startup scripts (`start-snapflow.sh`, `stop-snapflow.sh`) and logs are excluded from git to keep your local setup private.
