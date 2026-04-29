const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');

// Status & Public
router.get('/status', cmsController.getStatus);
router.get('/contents', cmsController.getContents);
router.post('/contact', cmsController.submitContact);

// Auth
router.post('/login', cmsController.login);
router.post('/logout', cmsController.logout);

// CMS Management
router.get('/messages', cmsController.getMessages);
router.get('/users', cmsController.getUsers);
router.get('/export', cmsController.exportData);
router.post('/contents', cmsController.saveContent);
router.delete('/contents/:id', cmsController.deleteContent);

module.exports = router;
