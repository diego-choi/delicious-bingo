import { describe, it, expect, vi, beforeEach } from 'vitest';
import MockAdapter from 'axios-mock-adapter';

// client.js를 동적으로 import하여 axiosRetry가 적용된 인스턴스를 테스트
let apiClient;
let mock;

describe('apiClient', () => {
  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();

    const module = await import('./client.js');
    apiClient = module.default;
    mock = new MockAdapter(apiClient);
  });

  it('should have timeout of 15000ms', () => {
    expect(apiClient.defaults.timeout).toBe(15000);
  });

  it('should retry on network error for GET requests', async () => {
    let callCount = 0;
    mock.onGet('/test').reply(() => {
      callCount++;
      if (callCount < 3) {
        return [500, {}];
      }
      return [200, { ok: true }];
    });

    const response = await apiClient.get('/test');
    expect(response.data).toEqual({ ok: true });
    expect(callCount).toBe(3);
  });

  it('should not retry POST requests on 5xx', async () => {
    let callCount = 0;
    mock.onPost('/test').reply(() => {
      callCount++;
      return [500, { error: 'server error' }];
    });

    await expect(apiClient.post('/test', {})).rejects.toThrow();
    expect(callCount).toBe(1);
  });

  it('should add auth token to requests', async () => {
    localStorage.setItem('authToken', 'test-token');
    mock.onGet('/test').reply(200, {});

    await apiClient.get('/test');

    expect(mock.history.get[0].headers.Authorization).toBe('Token test-token');
  });

  it('should remove auth token on 401 response', async () => {
    localStorage.setItem('authToken', 'test-token');
    mock.onGet('/test').reply(401, {});

    await expect(apiClient.get('/test')).rejects.toThrow();
    expect(localStorage.getItem('authToken')).toBeNull();
  });
});
