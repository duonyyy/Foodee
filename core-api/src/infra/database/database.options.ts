import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import { DATABASE_ENTITIES } from './entity-registry';

export function createDatabaseOptions(configService: ConfigService): TypeOrmModuleOptions {
  const maxPool = Number(configService.get('DB_POOL_MAX', 10)) || 10;
  const minPool = Number(configService.get('DB_POOL_MIN', 2)) || 2;
  const idleTimeout = Number(configService.get('DB_POOL_IDLE_TIMEOUT_MS', 30000)) || 30000;
  const connectionTimeout =
    Number(configService.get('DB_POOL_CONNECTION_TIMEOUT_MS', 5000)) || 5000;

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: DATABASE_ENTITIES,
    synchronize: false,
    // Migration files are timestamp-prefixed; exclude Jest *.spec.ts files.
    migrations: [path.join(__dirname, '..', '..', 'migrations', '[0-9]*{.ts,.js}')],
    migrationsRun: false,
    migrationsTableName: 'migrations',
    autoLoadEntities: false,
    retryAttempts: 1,
    retryDelay: 1000,
    maxQueryExecutionTime: 5000,
    poolSize: maxPool,
    extra: {
      max: maxPool,
      min: minPool,
      idleTimeoutMillis: idleTimeout,
      connectionTimeoutMillis: connectionTimeout,
    },
  };
}
