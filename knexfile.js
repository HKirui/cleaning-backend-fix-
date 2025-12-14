module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: "127.0.0.1",
      user: "platform_user",
      password: "joymella",
      database: "cleaning_platform",
      port: 5432,
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
