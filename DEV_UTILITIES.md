# Development Utilities - TBMNC Tracker

## 🛠️ Developer Tools and Scripts

This document provides useful commands, scripts, and utilities for development.

---

## 📦 Package Management

### Install Dependencies
```bash
# Install all dependencies (root + workspaces)
npm install

# Install only backend dependencies
npm install --workspace=packages/backend

# Install only frontend dependencies
npm install --workspace=packages/frontend

# Clean install (remove node_modules first)
rm -rf node_modules package-lock.json
npm install
```

### Update Dependencies
```bash
# Check for outdated packages
npm outdated

# Update all packages
npm update

# Update specific package
npm update <package-name>

# Interactive update (recommended)
npx npm-check-updates -i
```

---

## 🚀 Development Commands

### Start Services
```bash
# Start both backend and frontend
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Start with Firebase emulators
npm run firebase:emulators
# Then in another terminal:
npm run dev
```

### Build
```bash
# Build both packages
npm run build

# Build backend only
npm run build --workspace=packages/backend

# Build frontend only
npm run build --workspace=packages/frontend
```

### Code Quality
```bash
# Lint all code
npm run lint

# Lint and fix
npm run lint -- --fix

# Format code with Prettier
npm run format

# Type check
npm run type-check
```

---

## 🔥 Firebase Commands

### Emulators
```bash
# Start all emulators
npm run firebase:emulators

# Start specific emulator
firebase emulators:start --only firestore
firebase emulators:start --only auth
firebase emulators:start --only storage

# Export emulator data
firebase emulators:export ./emulator-data

# Import emulator data
firebase emulators:start --import=./emulator-data
```

### Database Operations
```bash
# Initialize Firebase
npm run firebase:init

# Seed database
npm run firebase:seed

# Deploy security rules
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

---

## 🧪 Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- path/to/test.spec.ts
```

### API Testing
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test API info
curl http://localhost:3000/api/v1

# Create test customer
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test Corp","contactEmail":"test@example.com"}'

# Get all customers
curl http://localhost:3000/api/v1/customers

# Get analytics
curl http://localhost:3000/api/v1/analytics/dashboard
```

---

## 🐛 Debugging

### Backend Debugging
```bash
# Start with Node inspector
node --inspect packages/backend/dist/index.js

# Start with breakpoints
node --inspect-brk packages/backend/dist/index.js

# VS Code launch configuration (add to .vscode/launch.json):
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "dev:backend"],
  "console": "integratedTerminal"
}
```

### View Logs
```bash
# Backend logs
tail -f packages/backend/logs/combined.log
tail -f packages/backend/logs/error.log

# Filter logs
grep "ERROR" packages/backend/logs/combined.log
grep "Customer" packages/backend/logs/combined.log
```

### Monitor Processes
```bash
# View running Node processes
ps aux | grep node

# Kill process on specific port
npx kill-port 3000
npx kill-port 5173

# View port usage
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Mac/Linux
```

---

## 📊 Database Utilities

### Firestore Operations
```bash
# Export Firestore data
firebase firestore:export gs://your-bucket/backups

# Import Firestore data
firebase firestore:import gs://your-bucket/backups/backup-file

# Delete collection (use with caution!)
firebase firestore:delete --all-collections --yes
```

### Query Firestore via CLI
```javascript
// In Node REPL or script
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

// Get all customers
const customers = await db.collection('customers').get();
customers.forEach(doc => console.log(doc.id, doc.data()));

// Query with filter
const active = await db.collection('customers')
  .where('status', '==', 'active')
  .get();
```

---

## 🔧 Environment Management

### Switch Environments
```bash
# Development (default)
cp .env.development .env

# Staging
cp .env.staging .env

# Production
cp .env.production .env
```

### Environment Variables
```bash
# View current environment
cat .env | grep FIREBASE

# Set environment variable temporarily
export FIREBASE_EMULATOR=true
npm run dev

# Windows PowerShell
$env:FIREBASE_EMULATOR="true"
npm run dev
```

---

## 📝 Git Workflows

### Common Git Commands
```bash
# Create feature branch
git checkout -b feature/new-feature

# Stage and commit
git add .
git commit -m "feat: Add new feature"

# Push to remote
git push origin feature/new-feature

# Update from main
git checkout main
git pull origin main
git checkout feature/new-feature
git merge main

# Squash commits
git rebase -i HEAD~3
```

### Commit Message Format
```
feat: Add new feature
fix: Fix bug in customer service
docs: Update API documentation
style: Format code
refactor: Refactor customer controller
test: Add customer service tests
chore: Update dependencies
```

---

## 🔍 Code Analysis

### Find Code Issues
```bash
# Find TODO comments
grep -r "TODO" packages/

# Find FIXME comments
grep -r "FIXME" packages/

# Find console.log statements
grep -r "console.log" packages/backend/src/

# Count lines of code
find packages/ -name "*.ts" -o -name "*.tsx" | xargs wc -l
```

### Dependency Analysis
```bash
# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check bundle size
npm run build
ls -lh packages/frontend/dist/
```

---

## 🚀 Performance Monitoring

### Monitor Memory Usage
```bash
# Node.js memory usage
node -e "console.log(process.memoryUsage())"

# Monitor in real-time
watch -n 1 'node -e "console.log(process.memoryUsage())"'
```

### API Performance Testing
```bash
# Using Apache Bench
ab -n 1000 -c 10 http://localhost:3000/api/v1/customers

# Using wrk
wrk -t12 -c400 -d30s http://localhost:3000/api/v1/customers

# Simple timing
time curl http://localhost:3000/api/v1/customers
```

---

## 📦 Build & Deploy

### Production Build
```bash
# Build for production
NODE_ENV=production npm run build

# Test production build locally
npm run start

# Build Docker image
docker build -t tbmnc-tracker .

# Run Docker container
docker run -p 3000:3000 tbmnc-tracker
```

### Deploy to Firebase Hosting
```bash
# Build frontend
npm run build --workspace=packages/frontend

# Deploy to Firebase
firebase deploy --only hosting

# Deploy with preview
firebase hosting:channel:deploy preview
```

---

## 🔐 Security Checks

### Check for Secrets
```bash
# Scan for potential secrets
git secrets --scan

# Check for exposed API keys
grep -r "API_KEY" . --exclude-dir=node_modules

# Verify .gitignore
git check-ignore -v .env
```

---

## 📚 Documentation

### Generate API Docs
```bash
# Generate TypeScript docs
npx typedoc --out docs packages/backend/src

# Generate OpenAPI spec (if configured)
npm run generate:openapi
```

### Update README
```bash
# Generate table of contents
npx markdown-toc -i README.md

# Check for broken links
npx markdown-link-check README.md
```

---

## 🎯 Quick Commands Reference

```bash
# Development
npm run dev                    # Start app
npm run build                  # Build app
npm run lint                   # Lint code
npm run format                 # Format code

# Firebase
npm run firebase:emulators     # Start emulators
npm run firebase:seed          # Seed data
firebase deploy                # Deploy all

# Testing
npm test                       # Run tests
curl http://localhost:3000/health  # Health check

# Utilities
npx kill-port 3000            # Kill port
npm outdated                   # Check updates
npm audit                      # Security check
```

---

## 💡 Pro Tips

1. **Use aliases**: Add to `.bashrc` or `.zshrc`
   ```bash
   alias dev="npm run dev"
   alias build="npm run build"
   alias test="npm test"
   ```

2. **VS Code extensions**:
   - ESLint
   - Prettier
   - Firebase
   - GitLens
   - Thunder Client (API testing)

3. **Git hooks**: Use Husky for pre-commit checks
   ```bash
   npx husky-init
   npx husky add .husky/pre-commit "npm run lint"
   ```

4. **Environment switching**: Use direnv for automatic env loading

5. **API testing**: Import `postman_collection.json` into Postman

---

**Happy Developing! 🚀**
