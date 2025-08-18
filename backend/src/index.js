import express from 'express';
import mongoose from 'mongoose';
import connectMongo from '../config/db.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoute from '../routes/auth.route.js';
import cors from 'cors';
import geminiResponse from '../gemini.js';
import aiRoute from '../routes/geminiRoute.js';
import path from 'path';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const __dirname = path.resolve();

// ===== CORS =====
app.use(cors({
  origin: process.env.URL || "http://localhost:5173",
  credentials: true
}));

// ===== Middleware =====
app.use(express.json());
app.use(cookieParser());

// ===== MongoDB =====
connectMongo();

// ===== API Routes =====
app.get('/hello', (req, res) => {
  res.send('Welcome to the Virtual Assistant API');
});

app.get('/', async (req, res) => {
  let prompt = req.query.prompt;
  let data = await geminiResponse(prompt);
  res.json(data);
});

app.use('/api/auth', authRoute);
app.use('/api/VA', aiRoute);

// ===== Serve Frontend =====
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
