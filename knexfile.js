require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cleaning_platform',
      port: process.env.DB_PORT || 5432
    },
    migrations: {
      directory: './db/migrations'
    },
    pool: { min: 2, max: 10 }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './db/migrations'
    },
    pool: { min: 2, max: 10 },
    acquireConnectionTimeout: 60000
  }
};
