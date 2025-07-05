const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const DATA_PATH = path.join(__dirname, 'data.json');

app.use(express.json(), cors());

function loadData() {
    if (!fs.existsSync(DATA_PATH)) {
        return {
            date: new Date().toISOString().split('T')[0],
            status: { morgens: false, mittags: false, abends: false },
            notiz: '',
            lastModified: new Date().toISOString()
        };
    }
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    try {
        return JSON.parse(raw);
    } catch (e) {
        return {
            date: new Date().toISOString().split('T')[0],
            status: { morgens: false, mittags: false, abends: false },
            notiz: '',
            lastModified: new Date().toISOString()
        };
    }
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
        data.notiz = '';
        data.lastModified = new Date().toISOString();
        saveData(data);
    }

    res.json({
        ...data.status,
        notiz: data.notiz,
        lastModified: data.lastModified
    });
});

app.post('/status', (req, res) => {
    const { morgens, mittags, abends, notiz, lastModified } = req.body;
    const current = loadData();

    if (
        typeof morgens !== 'boolean' ||
        typeof mittags !== 'boolean' ||
        typeof abends !== 'boolean' ||
        typeof notiz !== 'string'
    ) {
        return res.status(400).json({ error: 'Ungültige Datenstruktur' });
    }

    if (new Date(lastModified) < new Date(current.lastModified)) {
        return res.status(409).json({ error: 'Daten wurden zwischenzeitlich geändert' });
    }

    const updated = {
        date: new Date().toISOString().split('T')[0],
        status: { morgens, mittags, abends },
        notiz,
        lastModified: new Date().toISOString()
    };

    saveData(updated);
    res.json({ message: 'Status aktualisiert', lastModified: updated.lastModified });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
