import express from 'express';
import mongoose from 'mongoose';
import connectMongo from '../config/db.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoute from '../routes/auth.route.js';
import cors from 'cors';
import geminiResponse from '../gemini.js';
import aiRoute from '../routes/geminiRoute.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

const __dirname = path.resolve();
// ===== CORS =====
app.use(cors({
  origin: process.env.url || "http://localhost:5173",
  credentials: true
}));
app.use((req, res, next) => {
  try { decodeURIComponent(req.path); }
  catch (err) {
    console.error("❌ Malformed path (decode failed):", req.url);
    return res.status(400).send("Malformed URL");
  }
  next();
});

app.use((req, res, next) => {
  const invalidPattern = /\/:[^\w]/;
  if (invalidPattern.test(req.path)) {
    console.error("❌ Blocked malformed route pattern:", req.path);
    return res.status(400).send("Malformed route pattern");
  }
  next();
});



app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Fix wildcard route to comply with Express v5
app.get('/*splat', (req, res) => {
  console.log("⚠️ Wildcard route hit:", req.originalUrl);
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});


// ===== Middleware =====
app.use(express.json());
app.use(cookieParser());

// ===== MongoDB =====
connectMongo();

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



// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
