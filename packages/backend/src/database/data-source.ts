import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root (2 levels up from this file)
dotenv.config({ path: path.resolve(__dirname, '../../../..', '.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USER || 'tbmnc_user',
  password: process.env.DATABASE_PASSWORD || 'tbmnc_dev_password',
  database: process.env.DATABASE_NAME || 'tbmnc_dev',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: ['src/entities/**/*.ts'],
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: [],
});
