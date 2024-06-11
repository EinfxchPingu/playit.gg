const express = require('express');
const app = express();

// Statische Dateien im öffentlichen Verzeichnis bereitstellen
app.use(express.static('public'));

// POST-Anfragen verarbeiten
app.post('/proxy', (req, res) => {
    const url = req.query.url;
    if (!url) {
        return res.status(400).send('URL not provided');
    }
    // Hier den Code für den Proxy einfügen, um die URL zu laden und zurückzugeben
});

// Port festlegen und Server starten
const port = 3000;
app.listen(port, () => {
    console.log(`Proxy Unblocker running at http://localhost:${port}`);
});
