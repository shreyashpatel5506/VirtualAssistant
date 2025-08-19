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
const FRONTEND_URL = process.env.URL || process.env.FRONTEND_URL || 'http://localhost:5173';

const __dirname = path.resolve();
// ===== CORS =====
const allowedOrigins = [
  FRONTEND_URL,
  process.env.RENDER_EXTERNAL_URL,
  'http://localhost:5173',
  'https://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser tools/health checks
    const isAllowed = allowedOrigins.some(o => origin === o);
    return isAllowed ? callback(null, true) : callback(new Error('Not allowed by CORS'));
  },
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
// Note: SPA static hosting is configured after API routes below

// ===== Middleware =====
app.use(express.json());
app.use(cookieParser());

// ===== MongoDB =====
if (!process.env.MONGO_URI) {
  console.error('Missing MONGO_URI in environment');
}
connectMongo();

app.get('/hello', (req, res) => {
  res.send('Welcome to the Virtual Assistant API');
});

// Deprecated root handler removed to let SPA index.html handle '/'

app.use('/api/auth', authRoute);
app.use('/api/VA', aiRoute);

// ===== Static (Production) =====
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, "../frontend/dist");
  app.use(express.static(distPath));

  // Serve index.html for all non-API routes (Express v5 compatible)
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}
// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
