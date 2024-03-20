import express from 'express';
import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

const pool = createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

async function createIndexes() {
  try {
    const [tickerIndexRows] = await pool.query('SHOW INDEX FROM data WHERE Key_name = ?', ['idx_ticker']);
    if (tickerIndexRows.length === 0) {
      await pool.query('CREATE INDEX idx_ticker ON data (ticker)');
    }

    const [dateIndexRows] = await pool.query('SHOW INDEX FROM data WHERE Key_name = ?', ['idx_date']);
    if (dateIndexRows.length === 0) {
      await pool.query('CREATE INDEX idx_date ON data (date)');
    }
  } catch (error) {
    console.error('Error creating indexes: ', error);
  }
}

createIndexes();

app.get('/Api/ticker=:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const query = `SELECT * FROM data WHERE ticker = '${ticker}'`;
  try {
    const [rows] = await pool.query(query, [ticker]);
    res.json(rows);
  } catch (error) {
    console.error('Error executing query: ', error);
    res.status(500).send('Error retrieving data');
  }
});

app.get('/Api/ticker=:ticker/column=:column', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const columns = req.params.column.split(',').map(col => col.trim()).join(',');
  const query = `SELECT ${columns} FROM data WHERE ticker = '${ticker}'`;
  try {
    const [rows] = await pool.query(query, [ticker]);
    res.json(rows);
  } catch (error) {
    console.error('Error executing query: ', error);
    res.status(500).send('Error retrieving data');
  }
});

app.get('/Api/ticker=:ticker/column=:column/period=:period', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase();
  const columns = req.params.column.split(',').map(col => col.trim()).join(',');
  const period = req.params.period;
  const query = `SELECT ${columns} FROM data WHERE ticker = '${ticker}' AND date >= NOW() - INTERVAL ${period} YEAR`;
  try {
    const [rows] = await pool.query(query, [ticker, period]);
    res.json(rows);
  } catch (error) {
    console.error('Error executing query: ', error);
    res.status(500).send('Error retrieving data');
  }
});

const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});