# Development Environment Setup Guide

To run SnapFlow locally and continue development, you need to install the following tools on your Mac.

## 1. Package Manager (Homebrew)
We highly recommend using Homebrew to install these tools easily.
check if you have it:
```bash
brew --version
```
If not installed, paste this in your terminal:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

---

## 2. Docker (Required for entire stack)
Docker is needed to run the database (Postgres, Mongo), Authentication (Keycloak), and the full integrated stack.

**Option A (Brew):**
```bash
brew install --cask docker
```
*After install, open "Docker" from your Applications folder to finish setup.*

**Option B (Manual):**
Download **Docker Desktop for Mac** from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop).

---

## 3. Backend Development (Java & Maven)
Required to run and modify the `snapflow-engine` (Spring Boot). We use **Java 17**.

```bash
# Install OpenJDK 17
brew install openjdk@17

# Symlink it so the system can find it (run this after install)
sudo ln -sfn /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk

# Install Maven (Build tool)
brew install maven
```

---

## 4. Frontend Development (Node.js)
Required to run and modify `snapflow-designer` (Next.js). We recommend **Node version 20**.

```bash
brew install node@20

# If not linked automatically:
brew link node@20
```

---

## 5. Verification
Close and reopen your terminal, then check versions:

```bash
docker --version   # Should be 20.x or higher
java -version      # Should be "17.x"
mvn -version       # Should be 3.x
node -v            # Should be v20.x
npm -v             # Should be 10.x
```
