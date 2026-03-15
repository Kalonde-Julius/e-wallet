import { neon } from "@neondatabase/serverless";
import "dotenv/config";

// Creates an SQL connection using our DB URL from the .env file
export const sql = neon(process.env.DATABASE_URL);