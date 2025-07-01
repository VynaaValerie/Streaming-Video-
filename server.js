require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// API Configuration
const API_BASE_URL = 'https://api.botcahx.eu.org';
const API_KEY = 'YixeNo1';

// API endpoint to search videos
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const response = await axios.get(`${API_BASE_URL}/api/search/xnxx`, {
      params: {
        apikey: API_KEY,
        query: query
      },
      timeout: 10000
    });

    // Filter out empty results
    const filteredResults = response.data.result.filter(video => 
      video.title && video.link
    );

    res.json({
      ...response.data,
      result: filteredResults
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ 
      error: 'Failed to search videos',
      details: error.message
    });
  }
});

// API endpoint to get video details
app.get('/api/video', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    const response = await axios.get(`${API_BASE_URL}/api/download/xnxx`, {
      params: {
        apikey: API_KEY,
        url: url
      },
      timeout: 10000
    });

    res.json(response.data);
  } catch (error) {
    console.error('Video error:', error.message);
    res.status(500).json({ 
      error: 'Failed to get video details',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Serve your main HTML file for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});