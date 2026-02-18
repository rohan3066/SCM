const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const pg = require("pg");

const connectionString = process.env.DATABASE_URL;

const db = new pg.Client(
  connectionString
    ? {
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    }
    : {
      user: "postgres",
      host: "localhost",
      password: "rohan123",
      database: "scm",
      port: 5432,
    }
);

module.exports = db;
