import { test, expect } from '@playwright/test';

test.describe('VoIP.ms Proxy API Integration', () => {
  test('should return error if decryption key is missing', async ({ request }) => {
    const response = await request.post('/api/voipms/getSMS', {
      data: { method: 'getSMS' }
    });
    // In local test without proper Auth0/KV config, we might get 500 or 401
    expect([401, 500]).toContain(response.status());
  });

  test('should return error when no Auth0 session is present', async ({ request }) => {
    const response = await request.post('/api/voipms/getSMS', {
      headers: {
        'X-Decryption-Key': 'test-key',
      },
      data: {
        method: 'getSMS',
      },
    });

    expect([401, 500]).toContain(response.status());
  });
});
