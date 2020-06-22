import { createConnection } from 'typeorm';

export const testConn = (drop: boolean = false) => {
  return createConnection({
    name: 'default',
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: 'boilerplate_test',
    synchronize: drop,
    dropSchema: drop,
    entities: ['backend/entity/**/*.ts'],
    logging: false,
    migrations: ['backend/migration/**/*.ts'],
    subscribers: ['backend/subscriber/**/*.ts'],
    cli: {
      entitiesDir: 'backend/entity',
      migrationsDir: 'backend/migration',
      subscribersDir: 'backend/subscriber',
    },
  });
};
