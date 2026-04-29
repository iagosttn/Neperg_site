const express = require('express');
const router = express.Router();

// Controladores (A serem implementados com a logica extraida do antigo server.js)
// const authController = require('../controllers/authController');
// const contentController = require('../controllers/contentController');

router.get('/status', (req, res) => {
    res.json({ ok: true, message: "API MVC Endpoint migrated" });
});

module.exports = router;
