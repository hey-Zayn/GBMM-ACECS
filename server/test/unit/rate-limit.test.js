import { describe, expect, it, vi } from 'vitest';

const redisMock = vi.hoisted(() => ({
  incr: vi.fn(),
  expire: vi.fn(),
  ttl: vi.fn(),
}));

vi.mock('../../src/config/redis.js', () => ({ redis: redisMock }));

const { rateLimit } = await import('../../src/middlewares/rateLimit.middleware.js');

describe('rate limit middleware', () => {
  const request = { ip: '127.0.0.1', socket: { remoteAddress: '127.0.0.1' } };

  it('passes requests inside the configured limit', async () => {
    redisMock.incr.mockResolvedValue(1);
    redisMock.expire.mockResolvedValue(1);
    const next = vi.fn();

    await rateLimit({ windowSec: 60, max: 2, keyPrefix: 'test' })(request, {}, next);

    expect(redisMock.incr).toHaveBeenCalledWith('test:127.0.0.1');
    expect(redisMock.expire).toHaveBeenCalledWith('test:127.0.0.1', 60);
    expect(next).toHaveBeenCalledWith();
  });

  it('returns a rate-limit error after the configured limit', async () => {
    redisMock.incr.mockResolvedValue(3);
    redisMock.ttl.mockResolvedValue(42);
    const response = { set: vi.fn() };
    const next = vi.fn();

    await rateLimit({ windowSec: 60, max: 2, keyPrefix: 'test' })(request, response, next);

    expect(response.set).toHaveBeenCalledWith('Retry-After', '42');
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 429, code: 'RATE_LIMITED' });
  });

  it('fails closed when Redis is unavailable', async () => {
    redisMock.incr.mockRejectedValue(new Error('Redis unavailable'));
    const next = vi.fn();

    await rateLimit({ windowSec: 60, max: 2, keyPrefix: 'test' })(request, {}, next);

    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 503, code: 'SERVICE_UNAVAILABLE' });
  });
});
