import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const authmiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }

    try {
        const decoded = mongoose.Types.ObjectId(token);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}