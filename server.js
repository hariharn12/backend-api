// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const { Pool } = require('pg');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// app.use(express.json());
// app.use(cors({ origin: 'http://localhost:4200' }));


// const pool = new Pool({
//     user: process.env.PG_USER,
//     host: process.env.PG_HOST,
//     database: process.env.PG_DATABASE,
//     password: process.env.PG_PASSWORD,
//     port: process.env.PG_PORT,
// });

// // Register (Signup) endpoint
// app.post('/api/signup', async (req, res) => {
//     const { name, email, password } = req.body;  // Include name
//     try {
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = await pool.query(
//             'INSERT INTO signin (name, email, password) VALUES ($1, $2, $3) RETURNING *',  // Correct table name
//             [name, email, hashedPassword]  // Include name in the query
//         );
//         res.status(201).json(newUser.rows[0]);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// // Login endpoint
// app.post('/api/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await pool.query('SELECT * FROM signin WHERE email = $1', [email]);  // Use correct table name
//         if (user.rows.length === 0) {
//             return res.status(400).json({ error: 'User not found' });
//         }

//         const validPassword = await bcrypt.compare(password, user.rows[0].password);
//         if (!validPassword) {
//             return res.status(400).json({ error: 'Invalid password' });
//         }

//         const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
//             expiresIn: '1h',
//         });
//         res.json({ token });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });

// const PORT = process.env.PORT || 5000;  // Use a different port for backend (5000)
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// WARNING: This code is NOT secure and should NEVER be used in a production environment.
// Storing passwords in plain text is a severe security risk.

const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:4200' }));

const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

// Register (Signup) endpoint
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const newUser = await pool.query(
            'INSERT INTO signin (name, email, password) VALUES ($1, $2, $3) RETURNING *',
            [name, email, password] // WARNING: Password is stored in plain text
        );
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM signin WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'User not found' });
        }

        const validPassword = (password === user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid password' });
        }

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });
        res.json({ token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));