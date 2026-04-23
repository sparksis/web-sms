import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('https://voip.ms/api/v1/rest.php', ({ request }) => {
    const url = new URL(request.url);
    const method = url.searchParams.get('method');

    if (method === 'getDIDsInfo') {
      return HttpResponse.json({
        status: 'success',
        dids: [
          {
            number: '5551234567',
            sms_enabled: '1',
            mms_enabled: '1',
          },
        ],
      });
    }

    if (method === 'getSMS' || method === 'getMMS') {
      return HttpResponse.json({
        status: 'success',
        sms: [
          {
            id: '1',
            date: '2023-10-27 10:00:00',
            type: '1',
            did: '5551234567',
            contact: '5557654321',
            message: 'Hello from VoIP.ms',
          },
          {
            id: '2',
            date: '2023-10-27 10:05:00',
            type: '2',
            did: '5551234567',
            contact: '5557654321',
            message: 'Reply from us',
          },
        ],
      });
    }

    if (method === 'sendSMS') {
      return HttpResponse.json({
        status: 'success',
        sms: '123456',
      });
    }

    return HttpResponse.json({ status: 'invalid_method' });
  }),

  // Proxy mocks
  http.post('/api/voipms/session', () => {
    return HttpResponse.json({ success: true });
  }),

  http.post('/api/voipms/:method', async ({ params, request }) => {
    const { method } = params;
    const decryptionKey = request.headers.get('X-Decryption-Key');

    if (!decryptionKey) {
      return HttpResponse.json({ error: 'Missing decryption key' }, { status: 401 });
    }

    if (method === 'auth' || method === 'getDIDsInfo') {
        return HttpResponse.json({
            status: 'success',
            dids: [{ number: '5551234567', sms_enabled: '1' }]
        });
    }

    if (method === 'getSMS') {
      return HttpResponse.json({
        status: 'success',
        sms: [
          {
            id: '1',
            date: '2023-10-27 10:00:00',
            type: '1',
            did: '5551234567',
            contact: '5557654321',
            message: 'Hello via proxy',
          },
        ],
      });
    }

    return HttpResponse.json({ status: 'success' });
  }),
];
