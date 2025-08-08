import jsonwebtoken from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
    };
    return jsonwebtoken.sign(payload, JWT_SECRET, { expiresIn: "10d" });
}
const verifyToken = (token) => {
    try {
        return jsonwebtoken.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

export { generateToken, verifyToken };