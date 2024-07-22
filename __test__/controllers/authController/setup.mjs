import { createRequire } from 'module';
import amqplib from 'amqplib';
const require = createRequire(import.meta.url);
const pool = require('../../../models_RDS/databasePool');

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

export async function teardownTestDatabase() {
  await pool.query('DROP TABLE users;');
}
