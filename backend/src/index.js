import express from 'express';
import mongoose from 'mongoose';
import connectMongo from '../config/db.js'; // Import the MongoDB connection
import cookieParser from 'cookie-parser'; // Middleware to parse cookies
import dotenv from 'dotenv';
import authRoute from '../routes/auth.route.js';

const app = express();
dotenv.config();

const PORT = process.env.PORT || 8080;

app.use(express.json());

//connect mongodb
connectMongo();

// Define routes
app.get('/', (req, res) => {
    res.send('Welcome to the Virtual Assistant API');
});
app.get('/hello', (req, res) => {
    res.send('Hello, World!');
});
app.use(cookieParser()); // Middleware to parse cookies
app.use('/api/auth', authRoute); // Use the auth routes

app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});