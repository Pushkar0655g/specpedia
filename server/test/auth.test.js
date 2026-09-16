import { describe, it, expect, vi } from 'vitest';
import { requireAuth } from '../src/middleware/auth.js';

describe('requireAuth Middleware', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const req = { headers: {} };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          },
        };
      },
    };
    const next = vi.fn();

    await requireAuth(req, res, next);
    expect(statusSent).toBe(401);
    expect(jsonSent).toEqual({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when Authorization does not use Bearer format', async () => {
    const req = { headers: { authorization: 'Basic dXNlcjpwYXNz' } };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          },
        };
      },
    };
    const next = vi.fn();

    await requireAuth(req, res, next);
    expect(statusSent).toBe(401);
    expect(jsonSent).toEqual({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when token is an invalid jwt string', async () => {
    const req = { headers: { authorization: 'Bearer invalid_fake_token_123' } };
    let statusSent = null;
    let jsonSent = null;
    const res = {
      status: (code) => {
        statusSent = code;
        return {
          json: (data) => {
            jsonSent = data;
          },
        };
      },
    };
    const next = vi.fn();

    await requireAuth(req, res, next);
    expect(statusSent).toBe(401);
    expect(jsonSent).toEqual({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });
});
