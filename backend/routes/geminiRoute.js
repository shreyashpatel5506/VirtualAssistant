import express from 'express';
import { askToAssistant } from '../controllers/auth.controller.js';
import { authmiddleware } from './../middlewear/auth.middlewear';
const aiRoute = express.Router();

aiRoute.post('/getRespone', authmiddleware, askToAssistant);

export default aiRoute;