const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'moviecloud',
  port: 3306
});

router.get('/featured', async (req, res) => {
  try {
    const [movies] = await pool.query(
      `SELECT m.id, m.title, m.year, m.duration, m.synopsis, m.rating, 
              m.poster_url, m.backdrop_url, m.trailer_url, m.quality, m.view_count
       FROM movies m
       WHERE m.is_active = 1 AND m.featured = 1
       ORDER BY RAND()
       LIMIT 5`
    );
    
    console.log('Featured movies query result:', movies.length, 'movies');
    
    res.json({ success: true, data: { movies } });
  } catch (error) {
    console.error('Error fetching featured movies:', error);
    res.status(500).json({ error: 'Failed to fetch featured movies' });
  }
});

const app = express();
app.use(express.json());
app.use('/api/v1', router);

app.listen(3001, () => {
  console.log('Test server running on port 3001');
});

// Test the endpoint after a short delay
setTimeout(async () => {
  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/movies/featured',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log('Status:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('Response:', JSON.stringify(json, null, 2));
      } catch (e) {
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error('Error:', e);
  });
  
  req.end();
}, 1000);