import express from 'express';
import { askToAssistant } from '../controllers/auth.controller';
const aiRoute = express.Router();

aiRoute.post('/getRespone', askToAssistant);

export default aiRoute;