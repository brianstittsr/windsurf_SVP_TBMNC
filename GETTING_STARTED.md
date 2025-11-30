# Getting Started with TBMNC Tracker Development

## 🚀 Quick Start Guide

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (recommended) - [Download](https://code.visualstudio.com/)

### Step 1: Initial Setup

```bash
# Navigate to the project directory
cd tbmnc-tracker

# Install all dependencies (root + workspaces)
npm install

# Copy environment variables
copy .env.example .env

# Edit .env file with your configuration
# (Use notepad, VS Code, or your preferred editor)
```

### Step 2: Start Development Services

```bash
# Start Docker containers (PostgreSQL + Redis)
npm run dev:docker

# Wait for containers to be healthy (about 30 seconds)
# You can check status with: docker ps
```

### Step 3: Database Setup

```bash
# Create database and run migrations
npm run db:create
npm run db:migrate

# Seed with test data (optional)
npm run db:seed
```

### Step 4: Start Development Servers

```bash
# Start both backend and frontend
npm run dev

# OR start them separately in different terminals:
# Terminal 1: npm run dev:backend
# Terminal 2: npm run dev:frontend
```

### Step 5: Verify Installation

Open your browser and navigate to:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/health
- **Database Admin:** http://localhost:8080 (Adminer)

## 📁 Project Structure

```
tbmnc-tracker/
├── packages/
│   ├── backend/              # Node.js API
│   │   ├── src/
│   │   │   ├── controllers/  # Request handlers
│   │   │   ├── entities/     # TypeORM entities
│   │   │   ├── routes/       # API routes
│   │   │   ├── middleware/   # Express middleware
│   │   │   ├── utils/        # Utilities
│   │   │   └── index.ts      # Entry point
│   │   └── package.json
│   └── frontend/             # React app (to be created)
├── docker-compose.yml        # Development services
├── package.json              # Root package
└── README.md
```

## 🛠️ Development Workflow

### Daily Development

```bash
# Start your day
npm run dev:docker          # Start databases
npm run dev                 # Start dev servers

# During development
npm run lint                # Check code quality
npm run test                # Run tests
npm run type-check          # TypeScript validation

# End of day
docker-compose down         # Stop databases
```

### Database Operations

```bash
# Reset database (WARNING: Deletes all data)
npm run db:reset

# Create new migration
cd packages/backend
npm run migration:create -- -n MigrationName

# Run migrations
npm run db:migrate

# Seed test data
npm run db:seed
```

### Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🔧 Configuration

### Environment Variables

Key environment variables in `.env`:

```bash
# Database
DATABASE_URL=postgresql://tbmnc_user:tbmnc_dev_password@localhost:5432/tbmnc_dev

# Redis
REDIS_URL=redis://localhost:6379

# Auth0 (Get from Auth0 dashboard)
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# AWS (For file uploads)
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=tbmnc-tracker-documents
```

### Docker Services

Access Docker services:

- **PostgreSQL:** localhost:5432
  - User: `tbmnc_user`
  - Password: `tbmnc_dev_password`
  - Database: `tbmnc_dev`

- **Redis:** localhost:6379

- **Adminer:** http://localhost:8080
  - System: PostgreSQL
  - Server: postgres
  - Username: tbmnc_user
  - Password: tbmnc_dev_password

## 📝 API Documentation

### Available Endpoints

#### Health Check
```
GET /health
```

#### Customers
```
POST   /api/v1/customers           # Create customer
GET    /api/v1/customers/:id       # Get customer
PUT    /api/v1/customers/:id       # Update customer
GET    /api/v1/customers           # List customers
GET    /api/v1/customers/:id/stages    # Get qualification stages
GET    /api/v1/customers/:id/progress  # Get progress
```

#### Documents
```
POST   /api/v1/documents/upload    # Upload document
GET    /api/v1/documents/:id       # Get document
DELETE /api/v1/documents/:id       # Delete document
```

#### Analytics
```
GET    /api/v1/analytics/dashboard     # Dashboard metrics
GET    /api/v1/analytics/pipeline      # Pipeline analytics
GET    /api/v1/analytics/customer/:id  # Customer analytics
```

### Example API Calls

```bash
# Health check
curl http://localhost:3000/health

# Create a customer
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "legalName": "Test Company LLC",
    "companySize": "medium"
  }'

# Get all customers
curl http://localhost:3000/api/v1/customers
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

#### Docker Containers Not Starting
```bash
# Stop all containers
docker-compose down

# Remove volumes and restart
docker-compose down -v
docker-compose up -d
```

#### Database Connection Errors
```bash
# Check if PostgreSQL is running
docker ps

# View PostgreSQL logs
docker logs tbmnc-postgres

# Restart PostgreSQL
docker-compose restart postgres
```

#### TypeScript Errors
```bash
# Clear TypeScript cache
npm run clean

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. **Set up Auth0** - Create an Auth0 account and configure authentication
2. **Configure AWS S3** - Set up S3 bucket for document storage
3. **Create Frontend** - Initialize React frontend application
4. **Add Tests** - Write unit and integration tests
5. **Set up CI/CD** - Configure GitHub Actions for automated testing

## 🤝 Development Best Practices

### Code Style
- Use TypeScript for type safety
- Follow ESLint and Prettier rules
- Write meaningful commit messages
- Keep functions small and focused

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add customer registration endpoint"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Testing
- Write tests for all new features
- Maintain >90% code coverage
- Test edge cases and error scenarios
- Use meaningful test descriptions

## 📞 Support

- **Documentation:** See `/docs` folder
- **Issues:** Create GitHub issue
- **Team Chat:** [Your team communication channel]

## 🎉 You're Ready!

Your development environment is now set up. Start building amazing features for the TBMNC Tracker!

**Happy Coding! 🚀**
