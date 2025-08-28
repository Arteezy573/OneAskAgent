const express = require('express');
const path = require('path');

const router = express.Router();

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

router.get('/widget', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/widget.html'));
});

router.get('/teams-bot-demo', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/teams-bot-demo.html'));
});

module.exports = router;