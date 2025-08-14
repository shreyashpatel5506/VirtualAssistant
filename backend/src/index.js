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
import vosk from 'vosk';
import path from 'path';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

// ===== CORS =====
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

// ===== Middleware =====
app.use(express.json());
app.use(cookieParser());

// ===== MongoDB =====
connectMongo();

// ===== Vosk Setup =====
const upload = multer({ dest: "uploads/" });
const MODEL_PATH = path.join(process.cwd(), "model");
const SAMPLE_RATE = 16000;

if (!fs.existsSync(MODEL_PATH)) {
  console.error("Please download the Vosk model first!");
  process.exit(1);
}

vosk.setLogLevel(0);
const model = new vosk.Model(MODEL_PATH);

// ===== Routes =====
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

// ===== Speech-to-Text Endpoint =====
// app.post("/transcribe", upload.single("audio"), async (req, res) => {
//   try {
//     const rec = new vosk.Recognizer({ model, sampleRate: SAMPLE_RATE });
//     const data = fs.readFileSync(req.file.path);
//     rec.acceptWaveform(data);
//     const result = rec.finalResult();
//     rec.free();
//     fs.unlinkSync(req.file.path);
//     res.json(result);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// ===== Start Server =====
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
