import dns from "dns/promises";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcryptjs"; // Ensure bcrypt is imported correctly
import { generateToken, verifyToken } from "./token.js"; // Import the token generation function
import User from "../models/user.model.js";

dotenv.config();



const mailUser = process.env.MY_MAIL;
const mailPassword = process.env.MY_PASSWORD;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: mailUser,
        pass: mailPassword,
    },
});

const otpStorage = new Map();

export const sendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required", success: false });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.status(422).json({ message: "Invalid email format", success: false });

    try {
        const domain = email.split("@")[1];
        const mxRecords = await dns.resolveMx(domain);
        if (!mxRecords || mxRecords.length === 0) {
            return res.status(452).json({ message: "Email domain does not accept mail", success: false });
        }
    } catch (dnsError) {
        return res.status(452).json({ message: "Invalid or unreachable email domain", success: false });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const mailOptions = {
        from: `Virtual <${mailUser}>`,
        to: email,
        subject: "🔐 Your Virtual OTP Code",
        html: `Your OTP code is: <strong>${otp}</strong> (valid for 10 minutes)`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        if (info.accepted.includes(email)) {
            otpStorage.set(email, { otp, verified: false });
            return res.status(200).json({ message: "OTP sent", success: true });
        } else {
            return res.status(452).json({ message: "SMTP did not accept the email", success: false });
        }
    } catch (err) {
        return res.status(502).json({ message: "Failed to send email", success: false });
    }
};

export const verifyOTP = (req, res) => {
    const { email, otp } = req.body;
    const record = otpStorage.get(email);
    if (record && record.otp === otp) {
        otpStorage.set(email, { ...record, verified: true });
        return res.status(200).json({ message: "OTP verified", success: true });
    }
    return res.status(400).json({ message: "Invalid OTP", success: false });
};


export const signUP = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(422).json({ message: "Invalid email format", success: false });
        }

        const record = otpStorage.get(email);
        if (!record || !record.verified) {
            return res.status(400).json({ message: "OTP not verified", success: false });
        }
        if (record.verified) {
            otpStorage.delete(email); // Clear OTP after successful signup
        }
        const existingUser = User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists", success: false });
        }
        // Hash the password before saving
        if (password.length < 6) {
            return res.status(422).json({ message: "Password must be at least 6 characters", success: false });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        const token = generateToken(newUser);
        await newUser.save()

        res.cookie("token", token, {
            httpOnly: true,
            samesite: "strict",
            secure: false, // Set to true if using HTTPS
            maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
        });

        res.status(201).json({
            message: "User registered successfully",
            success: true,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
            token,
        });
    } catch (error) {
        console.error("Error during signup:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required", success: false });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password", success: false });
        }

        const token = generateToken(user);
        res.cookie("token", token, {
            httpOnly: true,
            samesite: "strict",
            secure: false, // Set to true if using HTTPS
            maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
        });

        res.status(200).json({
            message: "Login successful",
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
            token,
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}


export const passwordReset = async (req, res) => {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
    }

    if (newPassword.length < 6) {
        return res.status(422).json({ message: "Password must be at least 6 characters", success: false });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password reset successfully", success: true });
}


export const updateProfile = async (req, res) => {
    const { name, assistantName, assistantImage } = req.body;
    const userId = req.user.id; // Assuming user ID is stored in req.user

    if (!name || !assistantName || !assistantImage) {
        return res.status(400).json({ message: "All fields are required", success: false });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        user.name = name;
        user.assistantName = assistantName;
        user.assistantImage = assistantImage;

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                assistantName: user.assistantName,
                assistantImage: user.assistantImage,
            },
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const getUserProfile = async (req, res) => {
    const userId = req.user.id; // Assuming user ID is stored in req.user

    try {
        const user = await User.findById(userId).select("-password"); // Exclude password from response
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }

        res.status(200).json({
            message: "User profile retrieved successfully",
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                assistantName: user.assistantName,
                assistantImage: user.assistantImage,
                history: user.history,
            },
        });
    } catch (error) {
        console.error("Error retrieving user profile:", error);
        res.status(500).json({ message: "Internal server error", success: false });
    }
}

export const logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully", success: true });
}




