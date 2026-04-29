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

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, '..', 'storage', 'uploads')));
app.use(express.static(path.join(__dirname, '..')));

// Error handling fallback
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || "Erro interno do servidor." });
});

module.exports = app;
