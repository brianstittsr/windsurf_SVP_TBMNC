# TBMNC Tracker - Quick Start Guide

## 🚀 Get Running in 5 Minutes

### **Prerequisites**
- Node.js 20+
- Git

### **Step 1: Clone & Install** (2 minutes)
```bash
git clone https://github.com/brianstittsr/windsurf_SVP_TBMNC.git
cd windsurf_SVP_TBMNC
npm install
```

### **Step 2: Configure Environment** (1 minute)
```bash
# Copy environment files
cp .env.example .env
cp packages/frontend/.env.example packages/frontend/.env

# Edit .env if needed (defaults work for local dev)
```

### **Step 3: Start Application** (1 minute)
```bash
npm run dev
```

### **Step 4: Access Application** (1 minute)
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **Health Check**: http://localhost:3000/health

---

## 📊 Test the API

### **Get API Info**
```bash
curl http://localhost:3000/api/v1
```

### **Create a Customer**
```bash
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Acme Battery Corp",
    "status": "active",
    "currentStage": 1,
    "contactEmail": "contact@acme.com"
  }'
```

### **Get All Customers**
```bash
curl http://localhost:3000/api/v1/customers
```

### **Get Dashboard Analytics**
```bash
curl http://localhost:3000/api/v1/analytics/dashboard
```

---

## 🔥 Firebase Setup (Optional)

### **Option A: Use Emulators (Recommended for Development)**

**Requirements**: Java 11+

```bash
# 1. Install Java
# Download from: https://www.oracle.com/java/technologies/downloads/

# 2. Start Firebase Emulators
npm run firebase:emulators

# 3. In another terminal, seed data
npm run firebase:seed

# 4. Access Emulator UI
# Open: http://localhost:4000
```

### **Option B: Use Production Firebase**

```bash
# 1. Create Firebase project at console.firebase.google.com
# 2. Enable Firestore, Authentication, Storage
# 3. Download service account key → save as serviceAccountKey.json
# 4. Update .env:
#    FIREBASE_EMULATOR=false
#    FIREBASE_PROJECT_ID=your-project-id
# 5. Deploy rules
firebase deploy --only firestore:rules,storage:rules
# 6. Seed data
npm run firebase:seed
```

---

## 📁 Project Structure

```
tbmnc-tracker/
├── packages/
│   ├── backend/              # Express API + Firebase
│   │   ├── src/
│   │   │   ├── controllers/  # Request handlers
│   │   │   ├── services/     # Business logic
│   │   │   ├── routes/       # API routes
│   │   │   ├── firebase/     # Firebase config
│   │   │   └── index.ts      # Entry point
│   │   └── package.json
│   └── frontend/             # React + Vite
│       ├── src/
│       │   ├── pages/        # Page components
│       │   ├── components/   # Reusable components
│       │   ├── lib/          # Firebase, utils
│       │   └── main.tsx      # Entry point
│       └── package.json
├── firebase.json             # Firebase config
├── firestore.rules           # Security rules
├── .env                      # Backend environment
└── package.json              # Root workspace
```

---

## 🛠️ Common Commands

```bash
# Development
npm run dev                   # Start both backend & frontend
npm run dev:backend           # Start backend only
npm run dev:frontend          # Start frontend only

# Firebase
npm run firebase:emulators    # Start Firebase emulators
npm run firebase:init         # Initialize Firebase
npm run firebase:seed         # Seed sample data

# Build
npm run build                 # Build both packages
npm run lint                  # Lint all code
npm run type-check            # TypeScript check

# Testing
npm test                      # Run all tests
```

---

## 🔍 Available API Endpoints

### **Customers** (`/api/v1/customers`)
- `GET /customers` - List all customers
- `GET /customers/:id` - Get customer details
- `POST /customers` - Create customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `GET /customers/:id/stages` - Get qualification stages
- `GET /customers/:id/documents` - Get documents
- `GET /customers/:id/progress` - Get progress metrics

### **Analytics** (`/api/v1/analytics`)
- `GET /analytics/dashboard` - Dashboard metrics
- `GET /analytics/pipeline` - Pipeline overview
- `GET /analytics/customers/:id` - Customer analytics
- `POST /analytics/refresh` - Refresh metrics

---

## 📚 Documentation

- **`README.md`** - Project overview
- **`FIREBASE_SETUP.md`** - Detailed Firebase setup (500+ lines)
- **`FIREBASE_SCHEMA.md`** - Complete data schema (400+ lines)
- **`IMPLEMENTATION_STATUS.md`** - Current status & progress
- **`MIGRATION_SUMMARY.md`** - PostgreSQL → Firebase migration notes
- **`DEPLOYMENT.md`** - Production deployment guide

---

## 🐛 Troubleshooting

### **Port Already in Use**
```bash
# Kill process on port 3000 (backend)
npx kill-port 3000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

### **Firebase Connection Issues**
```bash
# Check if emulators are running
curl http://localhost:4000

# Verify environment variables
cat .env | grep FIREBASE
```

### **Module Not Found Errors**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### **TypeScript Errors**
```bash
# Check TypeScript configuration
npm run type-check

# Rebuild
npm run build
```

---

## 🎯 Next Steps

1. **Explore the UI**: Open http://localhost:5173
2. **Test API**: Use curl or Postman with examples above
3. **Review Docs**: Read `FIREBASE_SCHEMA.md` for data structure
4. **Setup Firebase**: Choose emulators or production
5. **Add Authentication**: Implement Auth0 or Firebase Auth
6. **Customize**: Modify components and add features

---

## 💡 Tips

- **Hot Reload**: Both frontend and backend support hot reload
- **Logs**: Check terminal for backend logs
- **Browser Console**: Check for frontend errors
- **Emulator UI**: View Firestore data at http://localhost:4000
- **API Testing**: Use Postman collection (coming soon)

---

## 🆘 Need Help?

1. Check `IMPLEMENTATION_STATUS.md` for current state
2. Review `FIREBASE_SETUP.md` for detailed setup
3. See `FIREBASE_SCHEMA.md` for data structure
4. Visit GitHub: https://github.com/brianstittsr/windsurf_SVP_TBMNC.git

---

**You're all set! Happy coding! 🚀**
