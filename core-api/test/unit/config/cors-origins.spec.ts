import { allowedCorsOrigins } from '../../../src/config/cors-origins';

describe('allowedCorsOrigins', () => {
  it('uses only configured HTTPS origins in production', () => {
    expect(
      allowedCorsOrigins({
        NODE_ENV: 'production',
        FRONTEND_URL: 'https://app.foodee.vn',
        ALLOWED_ORIGINS: ' https://app.foodee.vn/, https://admin.foodee.vn ',
      }),
    ).toEqual(['https://app.foodee.vn', 'https://admin.foodee.vn']);
  });

  it('rejects insecure and wildcard production origins', () => {
    expect(() =>
      allowedCorsOrigins({ NODE_ENV: 'production', FRONTEND_URL: 'http://localhost:3000' }),
    ).toThrow();
    expect(() => allowedCorsOrigins({ NODE_ENV: 'production', ALLOWED_ORIGINS: '*' })).toThrow();
  });

  it('keeps local development origins outside production', () => {
    expect(allowedCorsOrigins({ NODE_ENV: 'development' })).toContain('http://localhost:3000');
  });
});
