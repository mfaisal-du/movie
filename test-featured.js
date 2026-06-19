const mysql = require('mysql2/promise');

async function testFeaturedMovies() {
  try {
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'moviecloud',
      port: 3306
    });
    
    // Test the same query as in the featured movies endpoint
    const [movies] = await pool.execute(`
      SELECT m.id, m.title, m.year, m.duration, m.synopsis, m.rating, 
             m.poster_url, m.backdrop_url, m.trailer_url, m.quality, m.view_count
      FROM movies m
      WHERE m.is_active = 1 AND m.featured = 1
      ORDER BY RAND()
      LIMIT 5
    `);
    
    console.log('Featured movies query result:', movies.length, 'movies');
    console.log('Movies:', movies.map(m => ({id: m.id, title: m.title, featured: m.featured})));
    
    await pool.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

testFeaturedMovies();