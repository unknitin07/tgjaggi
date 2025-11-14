// server.js
// Simple Express server to accept tracking POSTs and append to clicks.txt
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const CLICK_FILE = path.join(__dirname, 'clicks.txt');

// Middlewares
app.use(express.json({ limit: '50kb' })); // parse JSON bodies
// Serve your static site from public/ (index.html above)
app.use(express.static(path.join(__dirname, 'public')));

// Track endpoint
app.post('/track-click', (req, res) => {
    try {
        // get IP (works behind proxies if you configure them)
        const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
        const entry = {
            timestamp: new Date().toISOString(),
            ip,
            userAgent: req.body.userAgent || req.headers['user-agent'] || '',
            href: req.body.href || '',
            language: req.body.language || '',
            screen: req.body.screen || {},
            referrer: req.body.referrer || ''
        };
        const line = JSON.stringify(entry) + '\n';
        fs.appendFile(CLICK_FILE, line, err => {
            if (err) {
                console.error('Failed to write click:', err);
                return res.status(500).send('error');
            }
            // respond quickly
            res.status(200).send('ok');
        });
    } catch (err) {
        console.error('track error', err);
        res.status(500).send('error');
    }
});

// start
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT}/ to view the site`);
});
