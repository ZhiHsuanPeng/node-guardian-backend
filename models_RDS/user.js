const pool = require('./databasePool');

exports.createUser = async (name, email, password) => {
  const results = await pool.query(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [
    name,
    email,
    password,
  ]);
  if (results[0].insertId) {
    return results[0].insertId;
  }
  throw Error('create user failed');
};
