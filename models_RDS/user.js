const pool = require('./databasePool');
const argon2 = require('argon2');

exports.createUser = async (name, email, password) => {
  const hashedPassword = await argon2.hash(password);
  const results = await pool.query(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [
    name,
    email,
    hashedPassword,
  ]);
  if (results[0].insertId) {
    return results[0].insertId;
  }
  throw Error('create user failed');
};
