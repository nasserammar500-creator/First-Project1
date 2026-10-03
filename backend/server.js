
const express = require('express');
const cors = require('cors');
const { Pool, types } = require('pg');
require('dotenv').config();

types.setTypeParser(1700, (val) => parseFloat(val));

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'expense_tracker',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const ALLOWED_CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

app.get('/api/expenses', async (req, res) => {
  try {
    const query = `
      SELECT id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date 
      FROM expenses 
      ORDER BY date DESC, id DESC;
    `;
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const query = `
      SELECT id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date 
      FROM expenses 
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/api/expenses', async (req, res) => {
  const { title, amount, category, date } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be a number greater than 0' });
  }
  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` });
  }
  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ message: 'Valid date is required (YYYY-MM-DD)' });
  }

  try {
    const query = `
      INSERT INTO expenses (title, amount, category, date) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date;
    `;
    const values = [title.trim(), parseFloat(amount), category, date];
    const result = await pool.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.put('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, date } = req.body;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required' });
  }
  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    return res.status(400).json({ message: 'Amount must be a number greater than 0' });
  }
  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}` });
  }
  if (!date || isNaN(Date.parse(date))) {
    return res.status(400).json({ message: 'Valid date is required (YYYY-MM-DD)' });
  }

  try {
    const query = `
      UPDATE expenses 
      SET title = $1, amount = $2, category = $3, date = $4 
      WHERE id = $5 
      RETURNING id, title, amount, category, TO_CHAR(date, 'YYYY-MM-DD') AS date;
    `;
    const values = [title.trim(), parseFloat(amount), category, date, id];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const query = 'DELETE FROM expenses WHERE id = $1 RETURNING id;';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense deleted successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});