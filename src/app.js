const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('node:path');
const apiRoutes = require('./routes/api');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Security Headers Middleware
app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    next();
});

// API Routes
app.use('/api', apiRoutes);
app.get('/healthz', (req, res) => res.json({ ok: true }));

const ROOT_DIR = path.join(__dirname, '..');
const dataStore = require('./services/dataStore');
app.use('/uploads', express.static(dataStore.UPLOAD_DIR));
app.use(express.static(ROOT_DIR));

// Fallback for index.html (SPA-like or just convenience)
app.get('*', (req, res, next) => {
    if (req.accepts('html')) {
        res.sendFile(path.join(ROOT_DIR, 'index.html'));
    } else {
        next();
    }
});

// Error handling fallback
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || "Erro interno do servidor." });
});

module.exports = app;
