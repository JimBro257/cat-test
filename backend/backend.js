const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

const DATA_PATH = path.join(__dirname, 'data.json');

app.use(express.json(), cors());

function loadData() {
    if (!fs.existsSync(DATA_PATH)) {
        return {
            date: new Date().toISOString().split('T')[0],
            status: { morgens: false, mittags: false, abends: false }
        };
    }
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    return JSON.parse(raw);
}

function saveData(data) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}

app.get('/status', (req, res) => {
    let data = loadData();
    const today = new Date().toISOString().split('T')[0];

    if (data.date !== today) {
        data.date = today;
        data.status = { morgens: false, mittags: false, abends: false };
        saveData(data);
    }

    res.json(data.status);
});

app.post('/status', (req, res) => {
    const incoming = req.body;

    if (
        typeof incoming.morgens !== 'boolean' ||
        typeof incoming.mittags !== 'boolean' ||
        typeof incoming.abends !== 'boolean'
    ) {
        return res.status(400).json({ error: 'Ungültige Datenstruktur' });
    }

    const data = {
        date: new Date().toISOString().split('T')[0],
        status: incoming
    };

    saveData(data);
    res.json({ message: 'Status aktualisiert' });
});

app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server läuft auf http://192.168.x.x:3000`);
});