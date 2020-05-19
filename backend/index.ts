import 'dotenv/config';
import 'reflect-metadata';

import startServer from './utils/server/start_server';

startServer(process.env.PORT || '3001');
