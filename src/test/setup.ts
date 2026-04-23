import '@testing-library/jest-dom';
import { fetch } from 'cross-fetch';
import { server } from '../mocks/server';

if (!global.fetch) {
  (global as any).fetch = fetch;
}

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
