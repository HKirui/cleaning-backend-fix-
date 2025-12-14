const knex = require("knex");
require("dotenv").config();

const db = knex({
  client: "pg",
  connection: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // THIS IS THE CRITICAL PART
  pool: { min: 0, max: 10 },
});

module.exports = db;
