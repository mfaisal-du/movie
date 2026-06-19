require('dotenv').config({ path: '../.env' });
const express = require('express');
const app = express();
const PORT = process.env.API_PORT || 3001;

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});