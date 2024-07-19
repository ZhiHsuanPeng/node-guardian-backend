const argon2 = require('argon2');
const pool = require('./databasePool');

exports.createUser = async (name, email, password) => {
  const hashedPassword = await argon2.hash(password);
  const results = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword],
  );
  if (results[0].insertId) {
    return results[0].insertId;
  }
  return Error('create user failed');
};

exports.findUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = ?', email);
  return result[0][0];
};

exports.isUserIdAndNameMatched = async (accountName, userId) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE name = ? AND id = ?',
    [accountName, userId],
  );
  if (result[0].length > 0) {
    return true;
  }
  return false;
};

exports.getAllUserInProject = async (token) => {
  const result = await pool.query(
    `SELECT u.email FROM projects AS p
    INNER JOIN access AS a ON a.projectId = p.id
    INNER JOIN users AS u ON u.id = a.userId WHERE p.token = ?`,
    [token],
  );
  return result[0];
};

exports.getOwnerByProjectNameAndAccountName = async (
  projectName,
  accountName,
) => {
  const result = await pool.query(
    `SELECT p.id AS projectId, u.name, u.email FROM projects AS p
    INNER JOIN access AS a ON a.projectId = p.id
    INNER JOIN users AS u ON u.id = a.userId WHERE p.name = ? AND u.name = ?`,
    [projectName, accountName],
  );
  return result[0];
};

exports.getOtherUsers = async (projectId) => {
  const result = await pool.query(
    `SELECT u.* FROM access  AS a
    INNER JOIN users AS u ON u.id = a.userId
    WHERE a.projectId = ?`,
    [projectId],
  );
  return result[0];
};

exports.getUserInfoById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  return result[0];
};
