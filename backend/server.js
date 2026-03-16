import express from 'express';
import dotenv from 'dotenv';
import { sql } from './config/db.js';

dotenv.config();

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

const PORT = process.env.PORT || 3000;

async function initDB() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
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

app.get('/api/transactions/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;

    const transactions = await sql`
      SELECT * FROM transactions WHERE user_id = ${user_id} ORDER BY created_at DESC`;

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Failed to fetch transactions' });
  }
});

app.post('/api/transactions', async (req, res) => {
 
  try {
    const { user_id, title, amount, category } = req.body; 
   
    if (!user_id || !title || amount === undefined || !category) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const transaction = await sql`
      INSERT INTO transactions (user_id, title, amount, category)   
      VALUES (${user_id}, ${title}, ${amount}, ${category}) RETURNING * `;
    res.status(201).json(transaction[0]);
  } catch (error) {
    console.error('Error inserting transaction:', error);
    res.status(500).json({ message: 'Failed to create transaction' });
  }     
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid transaction ID' });
    }

    const transaction = await sql`
      DELETE FROM transactions WHERE id = ${id} RETURNING *`;

    if (transaction.length === 0) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Failed to delete transaction' });
  }
});

app.get('/api/transactions/summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Calculate balance (sum of all amounts)
    const balanceResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as balance FROM transactions 
      WHERE user_id = ${userId}`;

    // Calculate income (positive amounts)
    const incomeResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as income FROM transactions 
      WHERE user_id = ${userId} AND amount > 0`;

    // Calculate expenses (negative amounts)
    const expenseResult = await sql`
      SELECT COALESCE(SUM(amount), 0) as expense FROM transactions 
      WHERE user_id = ${userId} AND amount < 0`

    res.status(200).json({
      income: incomeResult[0].income,
      expense: expenseResult[0].expense,
      balance: balanceResult[0].balance,
    });
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    res.status(500).json({ message: 'Failed to fetch transaction summary' });
  }
});


initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });   
}).catch((error) => {
  console.error('Failed to initialize the database:', error);
  process.exit(1);
});