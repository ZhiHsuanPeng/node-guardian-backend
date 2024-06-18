const pool = require('./databasePool');

exports.createProject = async (userId, projectName, accessToken) => {
  const results = await pool.query(`INSERT INTO projects ( name, token ) VALUES (?, ?)`, [projectName, accessToken]);
  const projectId = results[0].insertId;
  if (!projectId) {
    throw Error('create project failed');
  }
  await pool.query(`INSERT INTO access ( userId, projectId, level ) VALUES (? ,?, ?)`, [userId, projectId, 'admin']);
  return projectId;
};

exports.findProject = async (accessToken) => {
  const results = await pool.query(`SELECT * FROM projects WHERE token = ?`, [accessToken]);
  if (!results[0][0]) {
    return false;
  }
  return true;
};
