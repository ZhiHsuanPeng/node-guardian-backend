import { createRequire } from 'module';
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from 'vitest';
import supertest from 'supertest';
import {
  setupTestDatabase,
  teardownTestDatabase,
  returnCorrectLogData,
  returnIncorrectToken,
  returnMalformattedLog,
} from './setup';
const require = createRequire(import.meta.url);
const { app } = require('../../../app');

describe('log API', () => {
  let request;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(() => {
    request = supertest(app);
  });

  it('should return ok when token exists and in the right format', async () => {
    const logData = returnCorrectLogData();
    const response = await request.post('/api/v1/logs/newLogs').send(logData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'OK',
      }),
    );
  });

  it('should return 400 when token in logData not exists in DB', async () => {
    const logData = returnIncorrectToken();
    const response = await request.post('/api/v1/logs/newLogs').send(logData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: `Unable to send logs data to nodeguardian server because no project 
            is found with that access token, please check again!`,
      }),
    );
  });

  it('should return 400 when log data is malformed', async () => {
    const logData = returnMalformattedLog();
    const response = await request.post('/api/v1/logs/newLogs').send(logData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Invalid error log info, please check again',
      }),
    );
  });
});
