const pool = require('./databasePool');

exports.createProject = async (userId, projectName, accessToken) => {
  const results = await pool.query(
    'INSERT INTO projects ( name, token ) VALUES (?, ?)',
    [projectName, accessToken],
  );
  const projectId = results[0].insertId;
  if (!projectId) {
    throw Error('create project failed');
  }
  await pool.query(
    'INSERT INTO access ( userId, projectId, level ) VALUES (? ,?, ?)',
    [userId, projectId, 'admin'],
  );
  return projectId;
};

exports.findProject = async (accessToken) => {
  const results = await pool.query('SELECT * FROM projects WHERE token = ?', [
    accessToken,
  ]);
  if (!results[0][0]) {
    return false;
  }
  return true;
};

exports.isProjectNameExist = async (userId, projectName) => {
  const results = await pool.query(
    'SELECT * FROM access AS a INNER JOIN projects AS p ON a.projectId = p.id WHERE p.name = ? and a.userId = ?',
    [projectName, userId],
  );
  if (results[0].length > 0) {
    return true;
  }
  return false;
};

exports.getAllProjectByUserId = async (userId) => {
  const results = await pool.query(
    'SELECT * FROM access AS a INNER JOIN projects AS p ON a.projectId = p.id WHERE userId = ? ',
    [userId],
  );
  const projectTokenPair = {};
  results[0].forEach((row) => {
    projectTokenPair[row.name] = row.token;
  });
  return projectTokenPair;
};

exports.getProjectToken = async (userId, prjName) => {
  const results = await pool.query(
    'SELECT token FROM access AS a INNER JOIN projects AS p ON a.projectId = p.id WHERE a.userId = ? AND p.name = ?',
    [userId, prjName],
  );
  return results[0][0].token;
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
