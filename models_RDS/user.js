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

exports.findUserByEmail = async (email) => {
  const result = await pool.query(`SELECT * FROM users WHERE email = ?`, email);
  return result[0][0];
};

exports.isUserIdAndNameMatched = async (accountName, userId) => {
  const result = await pool.query(`SELECT * FROM users WHERE name = ? AND id = ?`, [accountName, userId]);
  if (result[0].length > 0) {
    return true;
  }
  return false;
};
