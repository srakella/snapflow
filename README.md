# SnapFlow

SnapFlow is a workflow engine and designer application.

## Project Structure

- **snapflow-designer**: Next.js frontend application.
- **snapflow-engine**: Spring Boot backend engine.

## Getting Started with Docker

This project is configured to run with Docker Compose.

### Prerequisites

- Docker
- Docker Compose

### Running the Application

1. Build and start all services:
   ```bash
   docker-compose up --build
   ```

2. Access the applications:
   - **SnapFlow Designer**: [http://localhost:3000](http://localhost:3000)
   - **SnapFlow Engine**: [http://localhost:8081](http://localhost:8081)
   - **Keycloak**: [http://localhost:8080](http://localhost:8080)

### Services

- **Methods**: Postgres (5432)
- **Engine**: Spring Boot App (8081)
- **Designer**: Next.js App (3000)
- **Auth**: Keycloak (8080)
- **NoSQL**: MongoDB (27017)
