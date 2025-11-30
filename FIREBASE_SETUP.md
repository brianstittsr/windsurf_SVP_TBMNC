# Firebase Setup Guide - TBMNC Tracker

## Overview

The TBMNC Tracker now uses Firebase as its backend database and storage solution, replacing the previous PostgreSQL + Docker setup. This provides:

- **Firestore**: NoSQL document database
- **Firebase Authentication**: User authentication
- **Firebase Storage**: File storage for documents
- **Real-time updates**: Live data synchronization
- **Serverless**: No infrastructure management
- **Local emulators**: Full local development environment

---

## Prerequisites

1. **Node.js 20+** installed
2. **Firebase account** (free tier available)
3. **Firebase CLI** (will be installed via npm)

---

## Initial Setup

### 1. Install Dependencies

```bash
cd tbmnc-tracker
npm install
```

This will install:
- `firebase-admin` (backend)
- `firebase` (frontend)
- `firebase-tools` (CLI)

### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it `tbmnc-tracker` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 3. Enable Firebase Services

In your Firebase project:

**Firestore Database:**
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select your region
5. Click "Enable"

**Authentication:**
1. Go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" provider
4. (Optional) Enable other providers as needed

**Storage:**
1. Go to "Storage"
2. Click "Get started"
3. Choose "Start in test mode"
4. Click "Done"

### 4. Get Firebase Configuration

**For Backend (Service Account):**
1. Go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `serviceAccountKey.json` in project root
4. **IMPORTANT**: Add this file to `.gitignore` (already done)

**For Frontend (Web App):**
1. Go to Project Settings > General
2. Scroll to "Your apps"
3. Click "Web" icon (</>) to add a web app
4. Register app with nickname "TBMNC Tracker Frontend"
5. Copy the `firebaseConfig` object

### 5. Configure Environment Variables

**Root `.env` file:**
```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=3000

# Firebase Backend
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_EMULATOR=false  # Set to true for local development
```

**Frontend `.env` file:**
```bash
cp packages/frontend/.env.example packages/frontend/.env
```

Edit `packages/frontend/.env`:
```env
# Use values from Firebase Console
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Set to false for production
VITE_USE_FIREBASE_EMULATOR=false
```

### 6. Deploy Security Rules

```bash
# Login to Firebase
npx firebase login

# Initialize Firebase in project (if not done)
npx firebase init

# Select:
# - Firestore
# - Storage
# - Emulators (optional)

# Deploy rules
npx firebase deploy --only firestore:rules,storage:rules
```

### 7. Initialize Database

```bash
# Initialize Firebase collections
npm run firebase:init

# Seed with sample data
npm run firebase:seed
```

---

## Local Development with Emulators

Firebase Emulators allow you to develop locally without touching production data.

### 1. Start Emulators

```bash
npm run firebase:emulators
```

This starts:
- Firestore Emulator (port 8080)
- Authentication Emulator (port 9099)
- Storage Emulator (port 9199)
- Emulator UI (port 4000)

### 2. Configure for Emulators

Set in `.env`:
```env
FIREBASE_EMULATOR=true
```

Set in `packages/frontend/.env`:
```env
VITE_USE_FIREBASE_EMULATOR=true
```

### 3. Seed Emulator Data

```bash
# With emulators running
npm run firebase:seed
```

### 4. Access Emulator UI

Open http://localhost:4000 to:
- View Firestore data
- Manage auth users
- Browse storage files
- View logs

---

## Running the Application

### Development Mode

```bash
# Terminal 1: Start Firebase Emulators (optional)
npm run firebase:emulators

# Terminal 2: Start Backend & Frontend
npm run dev
```

Access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Emulator UI**: http://localhost:4000

### Production Mode

```bash
# Build
npm run build

# Deploy to Firebase Hosting
npm run deploy:production
```

---

## Data Schema

See `FIREBASE_SCHEMA.md` for complete data structure documentation.

**Main Collections:**
- `users` - User profiles and roles
- `customers` - Customer/supplier information
  - `qualificationStages` (subcollection)
  - `documents` (subcollection)
  - `communications` (subcollection)
- `analytics` - Aggregated analytics data

---

## Security Rules

Security rules are defined in:
- `firestore.rules` - Database access control
- `storage.rules` - File storage access control

**Key Rules:**
- All reads require authentication
- Writes require manager/admin role
- File uploads validated for type and size
- Users can only edit their own profile

---

## Common Tasks

### Add a New User

```typescript
// In Firebase Console > Authentication
// Or via code:
import { getAuth } from 'firebase-admin/auth';

await getAuth().createUser({
  email: 'user@example.com',
  password: 'SecurePassword123',
  displayName: 'User Name',
});

// Then add to Firestore users collection
await db.collection('users').doc(uid).set({
  email: 'user@example.com',
  name: 'User Name',
  role: 'viewer',
  isActive: true,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
});
```

### Query Customers

```typescript
import { db } from './lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const q = query(
  collection(db, 'customers'),
  where('status', '==', 'active'),
  where('currentStage', '==', 2)
);

const snapshot = await getDocs(q);
const customers = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

### Upload a Document

```typescript
import { storage } from './lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const storageRef = ref(storage, `documents/${customerId}/${fileName}`);
await uploadBytes(storageRef, file);
const downloadURL = await getDownloadURL(storageRef);

// Save metadata to Firestore
await db.collection('customers')
  .doc(customerId)
  .collection('documents')
  .add({
    fileName,
    downloadURL,
    uploadedAt: Timestamp.now(),
    // ... other metadata
  });
```

---

## Troubleshooting

### "Permission denied" errors

- Check Firestore rules in Firebase Console
- Ensure user is authenticated
- Verify user has correct role

### Emulator connection issues

- Ensure emulators are running
- Check `FIREBASE_EMULATOR=true` in `.env`
- Clear browser cache/localStorage

### "Project not found" errors

- Verify `FIREBASE_PROJECT_ID` matches your project
- Check service account key is valid
- Run `firebase login` again

### Data not appearing

- Check Firestore indexes are deployed
- Verify security rules allow read access
- Check browser console for errors

---

## Migration from PostgreSQL

The previous Docker + PostgreSQL setup has been removed. Key changes:

| PostgreSQL | Firebase |
|------------|----------|
| Tables | Collections |
| Rows | Documents |
| Foreign keys | References / Denormalization |
| SQL queries | Firestore queries |
| Joins | Subcollections / Multiple queries |
| Transactions | Batch writes / Transactions |

**Data Migration:**
If you have existing PostgreSQL data, you'll need to:
1. Export data from PostgreSQL
2. Transform to Firestore document format
3. Import using Firebase Admin SDK

---

## Production Deployment

### 1. Update Environment Variables

Set production values in `.env` and `packages/frontend/.env`

### 2. Deploy Security Rules

```bash
firebase deploy --only firestore:rules,storage:rules --project production
```

### 3. Deploy Indexes

```bash
firebase deploy --only firestore:indexes --project production
```

### 4. Build and Deploy Application

```bash
npm run build
npm run deploy:production
```

### 5. Set up Firebase Hosting (Optional)

```bash
firebase init hosting
firebase deploy --only hosting
```

---

## Cost Considerations

Firebase free tier (Spark Plan) includes:
- 50K document reads/day
- 20K document writes/day
- 20K document deletes/day
- 1GB storage
- 10GB/month bandwidth

For production, consider Blaze Plan (pay-as-you-go) with:
- Budget alerts
- Usage monitoring
- Cost optimization strategies

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Emulators](https://firebase.google.com/docs/emulator-suite)
- [Best Practices](https://firebase.google.com/docs/firestore/best-practices)

---

## Support

For issues or questions:
1. Check Firebase Console logs
2. Review Emulator UI logs
3. Check browser console
4. Review `FIREBASE_SCHEMA.md`
5. Contact development team
