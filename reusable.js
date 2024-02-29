const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { body, validationResult } = require('express-validator');

const path = require('path');
require('dotenv').config();
require('./db/conn');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB

// Define a MongoDB schema and model
const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
});

const User = mongoose.model('User', userSchema);

// Middleware to parse request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve the static HTML file
app.use(express.static('public'));

// Validation middleware
const validateRegistration = [
  body('name').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirm-password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

// Handle form submission and store data in MongoDB
app.post('/submit', validateRegistration, async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Send validation errors back to the client
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { name, email, password } = req.body;
  
    try {
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // Email exists
        return res.json({ message: 'Email exists' });
      }
  
      // Create a new user
      const newUser = new User({ name, email, password });
      await newUser.save();
  
      // User created successfully
     // return res.status(201).json({ message: 'User created successfully' });
      return res.redirect('/login');
    } catch (error) {
      console.error('Error saving user:', error.message);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.get('/login', (req, res) => {
    res.render('login');
});
// Retrieve users from MongoDB
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
