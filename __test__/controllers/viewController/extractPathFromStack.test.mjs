import { createRequire } from 'module';
import { describe, it, expect, vi, beforeEach } from 'vitest';
const require = createRequire(import.meta.url);
const {
  extractPathFromStackTrace,
} = require('../../../controllers/viewController');

describe('extractPathFromStackTrace,', () => {
  it('extract path from UNIX system', () => {
    const err = 'at file:///home/ubuntu/test_server/index.js:26:8';
    expect(extractPathFromStackTrace(err)).toBe(
      '//home/ubuntu/test_server/index.js:26:8',
    );
  });

  it('extract path from Windows system', () => {
    const err =
      'at file:///C:/Users/USER/Desktop/project_test/os/index.js:24:15';
    expect(extractPathFromStackTrace(err)).toBe(
      '/C:/Users/USER/Desktop/project_test/os/index.js:24:15',
    );
  });
});
