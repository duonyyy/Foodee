import { ConfigService } from '@nestjs/config';
import { createDatabaseOptions } from 'src/infra/database/database.options';

describe('createDatabaseOptions', () => {
  it('applies default pool size of 10 and min of 2 when env is not set', () => {
    const configService = new ConfigService();
    const options = createDatabaseOptions(configService);

    expect(options.poolSize).toBe(10);
    expect(options.extra).toEqual({
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  });

  it('reads pool size and timeouts from environment variables when provided', () => {
    const customConfig = {
      DB_POOL_MAX: '25',
      DB_POOL_MIN: '5',
      DB_POOL_IDLE_TIMEOUT_MS: '15000',
      DB_POOL_CONNECTION_TIMEOUT_MS: '8000',
    };
    const configService = new ConfigService(customConfig);
    const options = createDatabaseOptions(configService);

    expect(options.poolSize).toBe(25);
    expect(options.extra).toEqual({
      max: 25,
      min: 5,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 8000,
    });
  });

  it('falls back to defaults when non-numeric or empty string values are provided', () => {
    const invalidConfig = {
      DB_POOL_MAX: 'not-a-number',
      DB_POOL_MIN: '',
      DB_POOL_IDLE_TIMEOUT_MS: 'NaN',
      DB_POOL_CONNECTION_TIMEOUT_MS: '0',
    };
    const configService = new ConfigService(invalidConfig);
    const options = createDatabaseOptions(configService);

    expect(options.poolSize).toBe(10);
    expect(options.extra).toEqual({
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  });
});
