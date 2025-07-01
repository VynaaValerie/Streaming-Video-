const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to search videos
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get(`https://api.botcahx.eu.org/api/search/xnxx?apikey=YixeNo1&query=${encodeURIComponent(query)}`);
    res.json(response.data);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search videos' });
  }
});

// API endpoint to get video details
app.get('/api/video', async (req, res) => {
  try {
    const { url } = req.query;
    const response = await axios.get(`https://api.botcahx.eu.org/api/download/xnxx?apikey=YixeNo1&url=${encodeURIComponent(url)}`);
    res.json(response.data);
  } catch (error) {
    console.error('Video error:', error);
    res.status(500).json({ error: 'Failed to get video details' });
  }
});

// Serve your main HTML file for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});