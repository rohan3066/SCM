require("dotenv").config();
const pg = require("pg");

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  password: "rohan123",
  database: "scm",
  port: 5432,
});

module.exports = db;
