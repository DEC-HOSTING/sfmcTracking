// Simple Node.js server for authentication
// This would run on a secure server, not GitHub Pages
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Environment variables (stored securely on server)
const VALID_EMAIL = process.env.VALID_EMAIL; // camelia.ounesli@loreal.com
const VALID_PASSWORD_HASH = process.env.VALID_PASSWORD_HASH; // hashed QueenCRM
const JWT_SECRET = process.env.JWT_SECRET;

// Hash function
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate JWT token
function generateToken(email) {
    const jwt = require('jsonwebtoken');
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: '8h' });
}

// Authentication endpoint
app.post('/api/auth', (req, res) => {
    const { email, password } = req.body;
    
    if (email === VALID_EMAIL && hashPassword(password) === VALID_PASSWORD_HASH) {
        const token = generateToken(email);
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Token validation endpoint
app.post('/api/validate', (req, res) => {
    const { token } = req.body;
    const jwt = require('jsonwebtoken');
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ valid: true, email: decoded.email });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

app.listen(3000, () => {
    console.log('Auth server running on port 3000');
});
