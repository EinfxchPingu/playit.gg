const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const cookieParser = require('cookie-parser');
const { URL } = require('url');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Statische Dateien im öffentlichen Verzeichnis bereitstellen
app.use(express.static('public'));

// GET-Anfragen an den Proxy verarbeiten
app.get('/proxy', (req, res) => {
    const url = req.query.url;
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
            // Überprüfen, ob die URL eine relative URL ist
            if (p2.startsWith('/') || p2.startsWith('./') || p2.startsWith('../')) {
                // Konstruieren Sie die vollständige URL unter Verwendung der Basis-URL der ursprünglichen Anfrage
                const baseUrl = new URL(url);
                const absoluteUrl = new URL(p2, baseUrl);
                return `${p1}="/proxy?url=${absoluteUrl}"`;
            } else {
                // Ansonsten handelt es sich um eine absolute URL, die nicht geändert werden muss
                return `${p1}="${p2}"`;
            }
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

// POST-Anfragen verarbeiten
app.post('/proxy', (req, res) => {
    const url = req.body.url;
    if (!url) {
        return res.status(400).send('URL not provided');
    }

    // Weiterleitung an GET /proxy mit der URL als Parameter
    res.redirect(`/proxy?url=${encodeURIComponent(url)}`);
});

// Port festlegen und Server starten
const port = 3000;
app.listen(port, () => {
    console.log(`Proxy Unblocker running at http://localhost:${port}`);
});
