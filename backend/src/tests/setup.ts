import { beforeAll } from 'vitest';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.RAWG_API_KEY = 'test-rawg-key';
});
