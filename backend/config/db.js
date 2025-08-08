import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;
const connectMongo = () => mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

export default connectMongo;