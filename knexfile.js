module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'platform_user',
      password: process.env.DB_PASSWORD || 'joymella',
      database: process.env.DB_NAME || 'cleaning_platform',
      port: process.env.DB_PORT || 5432,
    },
    migrations: {
      directory: './db/migrations',
    },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL, // Railway uses this
    migrations: {
      directory: './db/migrations',
    },
  },
};
