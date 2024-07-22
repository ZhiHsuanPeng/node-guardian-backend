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
import { setupTestDatabase, teardownTestDatabase } from './setup';
const require = createRequire(import.meta.url);
const { app } = require('../../../app');

describe('signUp API', () => {
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

  it('should return 200 when successfully sign up', async () => {
    const newUser = {
      name: 'Jeremy',
      email: 'jeremy@gmail.com',
      password: '123',
    };
    const response = await request.post('/api/v1/users/signup').send(newUser);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'cookie sent!',
        data: {
          user: {
            name: 'Jeremy',
            email: 'jeremy@gmail.com',
          },
        },
      }),
    );
  });

  it('should return 400 when email already exists', async () => {
    const newUser = {
      name: 'Jeremy2',
      email: 'jeremy@gmail.com',
      password: '123',
    };
    const response = await request.post('/api/v1/users/signup').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'user email already exists!',
      }),
    );
  });

  it('should return 400 when email format incorrect', async () => {
    const newUser = {
      name: 'Jeremy2',
      email: 'jeremy:@gmail.com',
      password: '123',
    };
    const response = await request.post('/api/v1/users/signup').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: ['error: Invalid email format '],
      }),
    );
  });

  it('should return 400 when name field is empty', async () => {
    const newUser = {
      name: '',
      email: 'jeremy@gmail.com',
      password: '123',
    };
    const response = await request.post('/api/v1/users/signup').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: ['error: Name is required '],
      }),
    );
  });

  it('should return 400 when password field is empty', async () => {
    const newUser = {
      name: 'Jeremy',
      email: 'jeremy@gmail.com',
      password: '',
    };
    const response = await request.post('/api/v1/users/signup').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: ['error: Password is required '],
      }),
    );
  });
});

describe('signIn API', () => {
  let request;

  beforeAll(async () => {
    await setupTestDatabase();
    request = supertest(app);
    const newUser = {
      name: 'Jeremy',
      email: 'jeremy@gmail.com',
      password: '123',
    };
    await request.post('/api/v1/users/signup').send(newUser);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(() => {
    request = supertest(app);
  });

  it('should return 200 when successfully sign in', async () => {
    const newUser = {
      email: 'jeremy@gmail.com',
      password: '123',
    };
    const response = await request.post('/api/v1/users/signin').send(newUser);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'cookie sent!',
        data: {
          user: {
            name: 'Jeremy',
            email: 'jeremy@gmail.com',
          },
        },
      }),
    );
  });

  it('should return 400 when password is incorrect', async () => {
    const newUser = {
      email: 'jeremy@gmail.com',
      password: '1234',
    };
    const response = await request.post('/api/v1/users/signin').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'incorrect password!',
      }),
    );
  });

  it('should return 400 when email field is empty', async () => {
    const newUser = {
      email: '',
      password: '1234',
    };
    const response = await request.post('/api/v1/users/signin').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: ['error: Invalid email format '],
      }),
    );
  });

  it('should return 400 when password field is empty', async () => {
    const newUser = {
      email: 'jeremy@gmail.com',
      password: '',
    };
    const response = await request.post('/api/v1/users/signin').send(newUser);

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: ['error: Password is required '],
      }),
    );
  });
});
