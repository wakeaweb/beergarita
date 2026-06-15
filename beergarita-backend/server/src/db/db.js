const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://beergarita:beergaritapass@localhost:5432/beergarita'
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
