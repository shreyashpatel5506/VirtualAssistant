import express from 'express';
import mongoose from 'mongoose';
import connectMongo from '../config/db.js'; // Import the MongoDB connection
import cookieParser from 'cookie-parser'; // Middleware to parse cookies
import dotenv from 'dotenv';
import authRoute from '../routes/auth.route.js';
import cors from 'cors';
import geminiResponse from '../gemini.js';
import aiRoute from '../routes/geminiRoute.js';

//give cors 


const app = express();
dotenv.config();

const PORT = process.env.PORT || 8080;

app.use(express.json());

//connect mongodb
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
connectMongo();

// Define routes
app.get('/hello', (req, res) => {
  res.send('Welcome to the Virtual Assistant API');
});
app.get('/', async (req, res) => {
  let prompt = req.query.prompt;
  let data = await geminiResponse(prompt);
  res.json(data);
});
app.use(cookieParser()); // Middleware to parse cookies
app.use('/api/auth', authRoute); // Use the auth routes
app.use('/api/VA', aiRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
//give cors 