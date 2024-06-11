const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const cookieParser = require('cookie-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Statische Dateien im öffentlichen Verzeichnis bereitstellen
app.use(express.static('public'));

// POST-Anfragen verarbeiten
app.post('/proxy', (req, res) => {
    const url = req.body.url;
    if (!url) {
        return res.status(400).send('URL not provided');
    }

    // Cookies verarbeiten
    const cookies = req.cookies;

    // Proxy-Anfrage an die angegebene URL senden
    request({
        url: url,
        headers: {
            'Cookie': Object.keys(cookies).map(key => `${key}=${cookies[key]}`).join('; ') // Cookies hinzufügen
        }
    }, (error, response, body) => {
        if (error) {
            return res.status(500).send('Error while fetching URL');
        }

        // Weiterleitungen über den Proxy
        const forwardedBody = body.replace(/(href|src)="([^"]+)"/g, (match, p1, p2) => {
            return `${p1}="/proxy?${p2}"`;
        });

        // Cookies speichern
        const setCookies = response.headers['set-cookie'];
        if (setCookies) {
            setCookies.forEach(cookie => {
                const parts = cookie.split(';')[0].split('=');
                const cookieName = parts[0];
                const cookieValue = parts[1];
                res.cookie(cookieName, cookieValue);
            });
        }

        res.send(forwardedBody);
    });
});

// Port festlegen und Server starten
const port = 3000;
app.listen(port, () => {
    console.log(`Proxy Unblocker running at http://localhost:${port}`);
});
