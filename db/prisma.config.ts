

import 'dotenv/config'; // ✅ load .env first
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'db/schema.prisma',
  migrations: {
    path: 'db/migrations',
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'), 
  },
  
});
