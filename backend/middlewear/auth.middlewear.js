import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const authmiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized access' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // decoded should contain { id, email }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
