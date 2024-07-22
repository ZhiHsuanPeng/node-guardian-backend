import { createRequire } from 'module';
import amqplib from 'amqplib';
const require = createRequire(import.meta.url);
const pool = require('../../../models_RDS/databasePool');
const redis = require('../../../utils/redis');

export async function setupTestDatabase() {
  await pool.query(`
   CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    role VARCHAR(255),
    picture VARCHAR(255)
    )
  `);
}

export async function setupSpecialSignup() {
  await pool.query(`
    CREATE TABLE projects (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     token VARCHAR(255) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     alertFirst ENUM('on', 'off') DEFAULT 'on',
     timeWindow ENUM('60', '300', '1800', '3600', '10800', 'off') DEFAULT 'off',
     quota INT DEFAULT 0,
     notification ENUM('on', 'off') DEFAULT 'on',
     reactivate ENUM('on', 'off') DEFAULT 'on'
     )
   `);

  await redis.set(
    'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
    1,
  );
}

export async function teardownTestDatabase() {
  await pool.query('DROP TABLE users;');
}
