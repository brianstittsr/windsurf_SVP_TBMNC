# TBMNC Customer Tracking System

> A modern, Firebase-powered web application for managing Toyota Battery Manufacturing North Carolina (TBMNC) supplier qualification process.

[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-20%2B-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.3-blue.svg)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/firebase-10.7-orange.svg)](https://firebase.google.com)

## ✨ Features

- 🔥 **Firebase Backend** - Serverless, scalable, real-time database
- 🎯 **Complete REST API** - 12+ endpoints with validation & rate limiting
- 📊 **Analytics Dashboard** - Real-time metrics and reporting
- 🔐 **Security First** - Input validation, rate limiting, CORS protection
- 📱 **Responsive UI** - Modern React interface with TailwindCSS
- 🧪 **Testing Ready** - Postman collection & comprehensive examples
- 📚 **Extensive Docs** - 2,500+ lines of documentation

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Git
- (Optional) Java 11+ for Firebase emulators

### Installation

```bash
# Clone the repository
git clone https://github.com/brianstittsr/windsurf_SVP_TBMNC.git
cd windsurf_SVP_TBMNC

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
cp packages/frontend/.env.example packages/frontend/.env

# Start development servers
npm run dev
```

**That's it!** The application will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api/v1
- **Health Check:** http://localhost:3000/health

### 📖 Detailed Guides
- **5-Minute Setup:** See [QUICK_START.md](QUICK_START.md)
- **Firebase Setup:** See [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
- **API Testing:** See [API_TESTING.md](API_TESTING.md)

## 📦 Project Structure

```
tbmnc-tracker/
├── packages/
│   ├── backend/              # Express API + Firebase Admin
│   │   ├── src/
│   │   │   ├── controllers/  # Request handlers
│   │   │   ├── services/     # Business logic (Firebase)
│   │   │   ├── routes/       # API routes
│   │   │   ├── middleware/   # Validation, rate limiting
│   │   │   ├── firebase/     # Firebase configuration
│   │   │   └── utils/        # Helpers, logging
│   │   └── package.json
│   └── frontend/             # React + Vite + Firebase
│       ├── src/
│       │   ├── pages/        # Page components
│       │   ├── components/   # Reusable components
│       │   ├── lib/          # Firebase client, utilities
│       │   └── main.tsx
│       └── package.json
├── firebase.json             # Firebase configuration
├── firestore.rules           # Database security rules
├── storage.rules             # Storage security rules
├── postman_collection.json   # API testing collection
├── API_TESTING.md            # API testing guide
├── FIREBASE_SCHEMA.md        # Data model documentation
└── package.json              # Root workspace config
```

## 🛠️ Development Commands

```bash
# Development
npm run dev                   # Start both backend & frontend
npm run dev:backend           # Backend only
npm run dev:frontend          # Frontend only

# Firebase
npm run firebase:emulators    # Start Firebase emulators
npm run firebase:init         # Initialize Firebase
npm run firebase:seed         # Seed sample data

# Code Quality
npm run lint                  # Lint all code
npm run format                # Format with Prettier
npm run type-check            # TypeScript check

# Build & Deploy
npm run build                 # Build all packages
npm run deploy:staging        # Deploy to Firebase staging
npm run deploy:production     # Deploy to Firebase production
```

## 🏗️ Technology Stack

### **Backend**
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Language:** TypeScript 5.3
- **Database:** Firebase Firestore
- **Storage:** Firebase Storage
- **Auth:** Firebase Auth (ready)
- **Logging:** Winston
- **Validation:** Express-validator
- **Security:** Helmet, CORS, Rate Limiting

### **Frontend**
- **Framework:** React 18
- **Build Tool:** Vite 5
- **Language:** TypeScript 5.3
- **Styling:** TailwindCSS 3
- **Routing:** React Router v6
- **State:** React Query
- **Firebase:** Firebase Client SDK

### **Infrastructure**
- **Database:** Firebase Firestore (NoSQL)
- **Storage:** Firebase Storage
- **Hosting:** Firebase Hosting (ready)
- **Functions:** Firebase Cloud Functions (ready)
- **Emulators:** Full local development environment

## 📚 Documentation

### **Getting Started**
- [Quick Start Guide](QUICK_START.md) - Get running in 5 minutes
- [Implementation Status](IMPLEMENTATION_STATUS.md) - Current project status
- [Getting Started](GETTING_STARTED.md) - Detailed setup guide

### **Firebase**
- [Firebase Setup](FIREBASE_SETUP.md) - Complete Firebase configuration (500+ lines)
- [Firebase Schema](FIREBASE_SCHEMA.md) - Data model documentation (400+ lines)
- [Migration Summary](MIGRATION_SUMMARY.md) - PostgreSQL → Firebase migration

### **Development**
- [API Testing Guide](API_TESTING.md) - API testing examples (400+ lines)
- [Development Utilities](DEV_UTILITIES.md) - Developer tools & commands (300+ lines)
- [Postman Collection](postman_collection.json) - Import into Postman

### **Deployment**
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions

### **Business Context**
- [Product Brief](../product-brief-tbmnc-tracker.md) - Product vision & requirements
- [Technical Specifications](../tech-spec-tbmnc-tracker.md) - Technical architecture
- [User Stories](../user-stories-tbmnc-tracker.md) - Feature requirements
- [Implementation Workflow](../workflow-implementation.md) - Development timeline

## 🎯 API Endpoints

### **Customers** (`/api/v1/customers`)
- `GET /customers` - List all customers (with filters)
- `GET /customers/:id` - Get customer details
- `POST /customers` - Create new customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `GET /customers/:id/stages` - Get qualification stages
- `GET /customers/:id/documents` - Get customer documents
- `GET /customers/:id/progress` - Get progress metrics

### **Analytics** (`/api/v1/analytics`)
- `GET /analytics/dashboard` - Dashboard metrics
- `GET /analytics/pipeline` - Pipeline overview
- `GET /analytics/customers/:id` - Customer analytics
- `POST /analytics/refresh` - Refresh metrics

**See [API_TESTING.md](API_TESTING.md) for detailed examples and testing guide.**

## 🔐 Security

- **Firestore Security Rules** - Row-level access control
- **Storage Rules** - File upload validation (type, size)
- **Input Validation** - Express-validator on all endpoints
- **Rate Limiting** - Configurable request limits
- **CORS Protection** - Configured origins
- **Helmet.js** - Security headers
- **Firebase Auth** - Ready for authentication integration

## 📊 Success Metrics

- **API Response Time:** <500ms (p95)
- **System Uptime:** 99.9% target
- **Code Coverage:** Target 80%+
- **Documentation:** 2,500+ lines
- **API Endpoints:** 12+ operational

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

**Quick Start:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

Proprietary - Strategic Value Plus

## 🆘 Support

- **Documentation:** Check the guides above
- **Issues:** [GitHub Issues](https://github.com/brianstittsr/windsurf_SVP_TBMNC/issues)
- **Email:** support@strategicvalue.com

## 🙏 Acknowledgments

- Toyota Battery Manufacturing North Carolina (TBMNC)
- Strategic Value Plus team
- All contributors

---

**Built with ❤️ for Strategic Value Plus**
