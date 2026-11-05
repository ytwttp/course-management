const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.static('public'));
app.use(express.json());
const PORT = 3000;

// Connect to PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'course_db',
    password: process.env.DB_PASSWORD,
    port: 5432
});

// Test database connection
pool.connect()
    .then(client => {
        console.log('Connected to PostgreSQL!');
        client.release();
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });

// Get all courses
app.get('/api/courses', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, credits FROM courses ORDER BY id'
        );

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching courses:', err);
        res.status(500).json({
            error: 'Failed to fetch courses'
        });
    }
});

// Add a new course
app.post('/api/courses', async (req, res) => {
    try {
        const { name, credits } = req.body;

        // Validate input
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                error: 'Course name is required'
            });
        }

        if (!Number.isInteger(credits) || credits < 1 || credits > 6) {
            return res.status(400).json({
                error: 'Credits must be between 1 and 6'
            });
        }

        // Insert course into database
        const result = await pool.query(
            'INSERT INTO courses (name, credits) VALUES ($1, $2) RETURNING id, name, credits',
            [name.trim(), credits]
        );

        res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error('Error adding course:', err);
        res.status(500).json({
            error: 'Failed to add course'
        });
    }
});

// Update a course
app.put('/api/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, credits } = req.body;

        // Validate input
        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({
                error: 'Course name is required'
            });
        }

        if (!Number.isInteger(credits) || credits < 1 || credits > 6) {
            return res.status(400).json({
                error: 'Credits must be between 1 and 6'
            });
        }

        const result = await pool.query(
            'UPDATE courses SET name = $1, credits = $2 WHERE id = $3 RETURNING id, name, credits',
            [name.trim(), credits, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Course not found'
            });
        }

        res.json(result.rows[0]);

    } catch (err) {
        console.error('Error updating course:', err);
        res.status(500).json({
            error: 'Failed to update course'
        });
    }
});

// Delete a course
app.delete('/api/courses/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM courses WHERE id = $1 RETURNING id, name, credits',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Course not found'
            });
        }

        res.json({
            message: 'Course deleted successfully',
            course: result.rows[0]
        });

    } catch (err) {
        console.error('Error deleting course:', err);
        res.status(500).json({
            error: 'Failed to delete course'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});