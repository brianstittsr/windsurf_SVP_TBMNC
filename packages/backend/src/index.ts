import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { initializeFirebase } from './firebase/config';
import { errorHandler } from './middleware/error-handler';
import { logger } from './utils/logger';
import routes from './routes/index-firebase';

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env') });

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || '1.0.0',
  });
});

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

// Initialize Firebase and start server
const startServer = async () => {
  try {
    // Initialize Firebase
    initializeFirebase();
    logger.info('Firebase initialized successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 TBMNC Tracker API running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`Firebase Emulator Mode: ${process.env.FIREBASE_EMULATOR === 'true'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

startServer();

export default app;
