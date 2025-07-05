const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL-Verbindung
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

app.use(cors());
app.use(express.json());


const initDb = async () => {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS status (
      id SERIAL PRIMARY KEY,
      date DATE UNIQUE NOT NULL,
      morgens BOOLEAN DEFAULT false,
      mittags BOOLEAN DEFAULT false,
      abends BOOLEAN DEFAULT false,
      note TEXT DEFAULT '',
      updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

app.get('/status', async (req, res) => {
    const today = new Date().toISOString().split('T')[0];
    try {
        const result = await pool.query('SELECT * FROM status WHERE date = $1', [today]);
        if (result.rows.length === 0) {
            await pool.query('INSERT INTO status(date) VALUES ($1)', [today]);
            return res.json({ morgens: false, mittags: false, abends: false, note: '' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'DB Fehler' });
    }
});

app.post('/status', async (req, res) => {
    const { morgens, mittags, abends, note } = req.body;
    const today = new Date().toISOString().split('T')[0];

    try {
        await pool.query(
            `INSERT INTO status(date, morgens, mittags, abends, note, updated)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
       ON CONFLICT (date)
       DO UPDATE SET morgens = $2, mittags = $3, abends = $4, note = $5, updated = CURRENT_TIMESTAMP`,
            [today, morgens, mittags, abends, note || '']
        );
        res.json({ message: 'Status gespeichert' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Datenbankfehler beim Speichern' });
    }
});

initDb().then(() => {
    app.listen(PORT, () => {
        console.log(`🐾 Server läuft auf Port ${PORT}`);
    });
});
