import pg from "pg";
import "dotenv/config";

// const Pool = new pg.Pool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

const Pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL_Neon,
  ssl: {
    rejectUnauthorized: false, // This disables SSL certificate validation
  },
});

export default Pool;
