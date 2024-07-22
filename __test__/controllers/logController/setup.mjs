import { createRequire } from 'module';
import amqplib from 'amqplib';
const require = createRequire(import.meta.url);
const pool = require('../../../models_RDS/databasePool');

const correctLog = {
  accessToken: 'k30qu3u6up46k4pvvz1e7',
  level: 'error',
  errMessage: 'Error: getaddrinfo ENOTFOUND',
  err:
    'Error: getaddrinfo ENOTFOUND\n' +
    '    at file:///C:/Users/USER/Desktop/project_test/os/index.js:24:15\n' +
    '    at Layer.handle [as handle_request] (C:\\Users\\USER\\Desktop\\project_test\\os\\node_modules\\express\\lib\\router\\layer.js:95:5)\n' +
    '    at next (C:\\Users\\USER\\Desktop\\project_test\\os\\node_modules\\express\\lib\\router\\route.js:149:13)\n' +
    '    at Route.dispatch (C:\\Users\\USER\\Desktop\\project_test\\os\\node_modules\\express\\lib\\router\\route.js:119:3)\n' +
    '    at Layer.handle [as handle_request] (C:\\Users\\USER\\Desktop\\project_test\\os\\node_modules\\express\\lib\\router\\layer.js:95:5)\n' +
    '    at C:\\Users\\USER\\Desktop\\project_test\\os\\node_modules\\express\\lib\\router\\index.js:284:15\n' +
    '    at Function.process_params (C:\\Users\\USER\\Desktop\\project_test\\os\\node_modules\\express\\lib\\router\\index.js:346:12)\n' +
    '    at next (C:\\Users\\USER\\Desktop\\project_test\\os\\node_modules\\express\\lib\\router\\index.js:280:10)\n' +
    '    at expressInit (C:\\Users\\USER\\Desktop\\project_test\\os\\node_modules\\express\\lib\\middleware\\init.js:40:5)\n' +
    '    at Layer.handle [as handle_request] (C:\\Users\\USER\\Desktop\\project_test\\os\\node_modules\\express\\lib\\router\\layer.js:95:5)',
  filteredReqObj: {
    headers: [
      'Host',
      'localhost:8080',
      'Connection',
      'keep-alive',
      'sec-ch-ua',
      '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
      'sec-ch-ua-mobile',
      '?0',
      'sec-ch-ua-platform',
      '"Windows"',
      'Upgrade-Insecure-Requests',
      '1',
      'User-Agent',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept',
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Sec-Fetch-Site',
      'none',
      'Sec-Fetch-Mode',
      'navigate',
      'Sec-Fetch-User',
      '?1',
      'Sec-Fetch-Dest',
      'document',
      'Accept-Encoding',
      'gzip, deflate, br, zstd',
      'Accept-Language',
      'en-US,en;q=0.9',
      'Cookie',
      'jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDQsImlhdCI6MTcyMTYxMTIyMCwiZXhwIjoxNzIyMjE2MDIwfQ.eECTUB76eZuIwSLWEdJaDfr8gprI63OyO17p6ruSC3E',
      'If-None-Match',
      'W/"13-PTpAN6L/xzRlD2R0fXpcxWPDF/Y"',
    ],
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    method: 'GET',
    protocol: 'http',
    requestIp: '::1',
    host: 'localhost',
    originalUrl: '/error',
    port: '8080',
    fullUrl: 'http://localhost:8080/error',
  },
  code:
    '  } catch (err) {\r\n' +
    '    console.log(err);\r\n' +
    '  }\r\n' +
    '});\r\n' +
    '\r\n' +
    'app.get("/error", (req, res, next) => {\r\n' +
    '  return next(Error("getaddrinfo ENOTFOUND"));\r\n' +
    '});\r\n' +
    '\r\n' +
    'app.get("/tra", (req, res, next) => {\r\n' +
    '  return next(Error("User Id not matched!"));\r',
  timestamp: 1721612865557,
  processArgs: [
    'C:\\Program Files\\nodejs\\node.exe',
    'C:\\Users\\USER\\Desktop\\project_test\\os\\index.js',
  ],
  processPid: 2280,
  deviceInfo: {
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    browser: { name: 'Chrome', version: '126.0.0.0', major: '126' },
    engine: { name: 'Blink', version: '126.0.0.0' },
    os: { name: 'Windows', version: '10' },
    device: {},
    cpu: { architecture: 'amd64' },
  },
  serverIp: '10.101.8.255',
  publicIp: { ip: '59.120.11.125' },
};

export async function setupTestDatabase() {
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
  await pool.query(`
    INSERT INTO projects (name, token, alertFirst, timeWindow, quota, notification, reactivate) VALUES
    ('Jeremy', 'k30qu3u6up46k4pvvz1e7', 'on', '60', 1, 'on', 'on');
  `);
}

export async function teardownTestDatabase() {
  await pool.query('DROP TABLE projects;');
  await pool.end();
}

export function returnCorrectLogData() {
  const log = structuredClone(correctLog);
  return log;
}

export function returnIncorrectToken() {
  const log = structuredClone(correctLog);
  // token invalid
  log.accessToken = '123';
  return log;
}

export function returnMalformattedLog() {
  const log = structuredClone(correctLog);
  // missing device info
  log.deviceInfo = '';
  return log;
}
