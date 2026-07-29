import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT) || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'bitschool_db';

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 10,
    min: 0,
    acquire: 10000,
    idle: 10000
  }
});

export async function connectDB() {
  try {
    // 1. Create database if not exists
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    // 2. Authenticate Sequelize
    await sequelize.authenticate();
    console.log(`[MySQL] Connected & authenticated to database '${dbName}' on ${dbHost}:${dbPort}`);
    return true;
  } catch (error) {
    console.warn(`[MySQL] Server notice (${error.message}). Running in fallback memory mode.`);
    return false;
  }
}