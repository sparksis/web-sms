import { describe, it, expect } from 'vitest';
import { parseVoipMsSms, parseVoipMsDid } from './parsers';

describe('Data Parsers', () => {
  it('should parse VoIP.ms SMS correctly', () => {
    const rawSms = {
      id: '123',
      date: '2023-10-27 10:00:00',
      type: '1',
      did: '5551112222',
      contact: '5553334444',
      message: 'Hello world',
    };

    const parsed = parseVoipMsSms(rawSms);

    expect(parsed).toEqual({
      id: '123',
      date: '2023-10-27 10:00:00',
      type: 'incoming',
      did: '5551112222',
      contact: '5553334444',
      message: 'Hello world',
    });
  });

  it('should parse VoIP.ms DID correctly', () => {
    const rawDid = {
      number: '5551112222',
      sms_enabled: '1',
    };

    const parsed = parseVoipMsDid(rawDid);

    expect(parsed).toEqual({
      number: '5551112222',
      sms_enabled: true,
    });
  });

  it('should handle disabled SMS for DID', () => {
    const rawDid = {
      number: '5551112222',
      sms_enabled: '0',
    };

    const parsed = parseVoipMsDid(rawDid);

    expect(parsed.sms_enabled).toBe(false);
  });
});
