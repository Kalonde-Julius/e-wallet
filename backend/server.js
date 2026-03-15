import express from 'express';
import dotenv from 'dotenv';
import { sql } from './config/db.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 1) NOT NULL,
      category VARCHAR(50) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    console.log('Database initialized successfully');
  } catch (error) {         
    console.error('Error connecting to the DB:', error);
    process.exit(1); // status code 1 means failure, 0 means success
  }
}

app.get('/', (req, res) => {
  res.send('Hello, Vigilant !');
});


initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });   
}).catch((error) => {
  console.error('Failed to initialize the database:', error);
  process.exit(1);
});