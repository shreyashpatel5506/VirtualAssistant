import dns from "dns/promises";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcryptjs"; // Ensure bcrypt is imported correctly
import { generateToken, verifyToken } from "./token.js"; // Import the token generation function
import User from "../models/user.model.js";
import uploadOnCloudinary from './../config/cloudinary.js';
import geminiResponse from "../gemini.js";
import moment from "moment";

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
        const existingUser = await User.findOne({ email });
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
        if (record.verified) {
            otpStorage.delete(email); // Clear OTP after successful signup
        }

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
    try {
        const { assistantName, assistantImage } = req.body;
        const userId = req.user.id; // now from JWT middleware

        if (!assistantName && !req.file && !assistantImage) {
            return res.status(400).json({
                message: "Assistant name and image are required",
                success: false,
            });
        }

        // Start with image from body, will override if file is uploaded
        let finalImage = assistantImage;

        if (req.file) {
            const uploaded = await uploadOnCloudinary(req.file);
            finalImage = uploaded?.url || uploaded; // handle object or string return
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { assistantName, assistantImage: finalImage },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            success: true,
            user: {
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                assistantName: updatedUser.assistantName,
                assistantImage: updatedUser.assistantImage,
            },
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};


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

import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/** 
 * Helper to create a temporary HTML/Markdown file and serve via /docs/:id
 */
const createTempDoc = (content, isMarkdown = true) => {
    const id = uuidv4();
    const filePath = path.join(process.cwd(), "tempDocs");
    if (!fs.existsSync(filePath)) fs.mkdirSync(filePath);

    const fullFile = path.join(filePath, `${id}.html`);
    const htmlContent = `
        <html>
          <head>
            <meta charset="UTF-8"/>
            <title>Assistant Generated Doc</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              pre { background: #f4f4f4; padding: 10px; border-radius: 8px; }
            </style>
          </head>
          <body>
            ${isMarkdown ? `<pre>${content}</pre>` : content}
          </body>
        </html>
    `;
    fs.writeFileSync(fullFile, htmlContent, "utf-8");

    // return public route (you need express static setup for /docs)
    return `/docs/${id}.html`;
};

export const askToAssistant = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const userMessage = req.body.message; // Voice-to-text or typed
        const assistantName = user.assistantName;
        const authorName = user.name;

        const result = await geminiResponse(userMessage, assistantName, authorName);

        const jsonMatch = result.text.match(/{[\s\S]*}/);
        if (!jsonMatch) {
            return res.status(200).json({
                response: "Sorry, I can't understand."
            });
        }

        const gemResult = JSON.parse(jsonMatch[0]);
        const type = gemResult.type;

        switch (type) {
            /** ===================== GENERAL ===================== **/
            case "general":
            case "ai_chat":
                return res.json({
                    type,
                    userInput: gemResult.userinput,
                    response: gemResult.response
                });

            /** ===================== SEARCH & MEDIA ===================== **/
            case "google_search":
                return res.json({
                    type,
                    userInput: gemResult.userinput,
                    response: `Searching Google for "${gemResult.userinput}"`,
                    actionUrl: `https://www.google.com/search?q=${encodeURIComponent(gemResult.userinput)}`
                });
            case "youtube_search":
                return res.json({
                    type,
                    userInput: gemResult.userinput,
                    response: `Searching YouTube for "${gemResult.userinput}"`,
                    actionUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(gemResult.userinput)}`
                });
            case "youtube_play":
                return res.json({
                    type,
                    userInput: gemResult.userinput,
                    response: `Playing on YouTube: ${gemResult.userinput}`,
                    actionUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(gemResult.userinput)}`
                });
            case "spotify_play":
                return res.json({
                    type,
                    userInput: gemResult.userinput,
                    response: `Playing on Spotify: ${gemResult.userinput}`,
                    actionUrl: `https://open.spotify.com/search/${encodeURIComponent(gemResult.userinput)}`
                });

            /** ===================== DATE & TIME ===================== **/
            case "get_time":
                return res.json({
                    type,
                    userInput: gemResult.userinput,
                    response: `Current time is ${moment().format("HH:mm:ss")}`
                });
            case "get_date":
                return res.json({
                    type,
                    userInput: gemResult.userinput,
                    response: `Current date is ${moment().format("YYYY-MM-DD")}`
                });
            case "get_day":
                return res.json({
                    type,
                    userInput: gemResult.userinput,
                    response: `Today is ${moment().format("dddd")}`
                });
            case "get_month":
                return res.json({
                    type,
                    userInput: gemResult.userinput,
                    response: `Current month is ${moment().format("MMMM")}`
                });

            /** ===================== TOOLS & APPS ===================== **/
            case "calculator_open":
                return res.json({ type, userInput: gemResult.userinput, response: gemResult.response });

            case "calendar_open":
                return res.json({
                    type,
                    userInput: gemResult.userinput,
                    response: gemResult.response,
                    relatedAction: "reminder_set" // ✅ clicking calendar can open reminders
                });

            case "notes_open":
                return res.json({
                    type,
                    userInput: gemResult.userinput,
                    response: gemResult.response,
                    relatedAction: "reminder_set" // ✅ clicking notes can open reminders
                });

            case "reminder_set":
            case "alarm_set":
                return res.json({ type, userInput: gemResult.userinput, response: gemResult.response });

            /** ===================== SOCIAL MEDIA ===================== **/
            case "instagram_open":
                return res.json({ type, userInput: gemResult.userinput, response: "Opening Instagram", actionUrl: "https://instagram.com" });
            case "facebook_open":
                return res.json({ type, userInput: gemResult.userinput, response: "Opening Facebook", actionUrl: "https://facebook.com" });
            case "twitter_open":
                return res.json({ type, userInput: gemResult.userinput, response: "Opening Twitter/X", actionUrl: "https://twitter.com" });
            case "whatsapp_open":
                return res.json({ type, userInput: gemResult.userinput, response: "Opening WhatsApp", actionUrl: "https://web.whatsapp.com" });
            case "telegram_open":
                return res.json({ type, userInput: gemResult.userinput, response: "Opening Telegram", actionUrl: "https://web.telegram.org" });
            case "snapchat_open":
                return res.json({ type, userInput: gemResult.userinput, response: "Opening Snapchat", actionUrl: "https://www.snapchat.com" });
            case "linkedin_open":
                return res.json({ type, userInput: gemResult.userinput, response: "Opening LinkedIn", actionUrl: "https://linkedin.com" });

            /** ===================== WEATHER & LOCATION ===================== **/
            case "weather_show":
                return res.json({
                    type,
                    userInput: gemResult.userinput,
                    response: `Fetching weather for ${gemResult.userinput}`,
                    actionUrl: `https://www.google.com/search?q=${encodeURIComponent(gemResult.userinput + " weather")}`
                });
            case "maps_open":
                return res.json({
                    type,
                    userInput: gemResult.userinput,
                    response: `Opening maps for ${gemResult.userinput}`,
                    actionUrl: `https://www.google.com/maps/search/${encodeURIComponent(gemResult.userinput)}`
                });
            case "location_share":
                return res.json({ type, userInput: gemResult.userinput, response: "Sharing your current location" });

            /** ===================== SPORTS ===================== **/
            case "live_cricket_score":
                return res.json({ type, userInput: gemResult.userinput, response: `Searching live cricket scores for "${gemResult.userinput}"`, actionUrl: `https://www.google.com/search?q=${encodeURIComponent(gemResult.userinput + " live cricket score")}` });
            case "live_football_score":
                return res.json({ type, userInput: gemResult.userinput, response: `Searching live football scores for "${gemResult.userinput}"`, actionUrl: `https://www.google.com/search?q=${encodeURIComponent(gemResult.userinput + " live football score")}` });
            case "sports_news":
                return res.json({ type, userInput: gemResult.userinput, response: `Fetching latest sports news for "${gemResult.userinput}"`, actionUrl: `https://www.google.com/search?q=${encodeURIComponent(gemResult.userinput + " sports news")}` });

            /** ===================== NEWS & ENTERTAINMENT ===================== **/
            case "news_latest":
                return res.json({ type, userInput: gemResult.userinput, response: `Fetching latest news`, actionUrl: `https://news.google.com` });
            case "movie_info":
                return res.json({ type, userInput: gemResult.userinput, response: `Searching movie info for "${gemResult.userinput}"`, actionUrl: `https://www.google.com/search?q=${encodeURIComponent(gemResult.userinput + " movie")}` });
            case "tv_show_info":
                return res.json({ type, userInput: gemResult.userinput, response: `Searching TV show info for "${gemResult.userinput}"`, actionUrl: `https://www.google.com/search?q=${encodeURIComponent(gemResult.userinput + " TV show")}` });
            case "celebrity_info":
                return res.json({ type, userInput: gemResult.userinput, response: `Searching info about "${gemResult.userinput}"`, actionUrl: `https://www.google.com/search?q=${encodeURIComponent(gemResult.userinput)}` });

            /** ===================== UTILITIES ===================== **/
            case "translate_text":
            case "currency_convert":
            case "unit_convert":
            case "system_command":
                return res.json({ type, userInput: gemResult.userinput, response: `Searching for ${type.replace("_", " ")}`, actionUrl: `https://www.google.com/search?q=${encodeURIComponent(gemResult.userinput)}` });

            /** ===================== FINANCE & BUSINESS ===================== **/
            case "stock_price":
                return res.json({ type, userInput: gemResult.userinput, response: `Fetching stock price for ${gemResult.userinput}`, actionUrl: `https://www.google.com/search?q=${encodeURIComponent(gemResult.userinput + " stock price")}` });
            case "crypto_price":
                return res.json({ type, userInput: gemResult.userinput, response: `Fetching crypto price for ${gemResult.userinput}`, actionUrl: `https://www.google.com/search?q=${encodeURIComponent(gemResult.userinput + " crypto price")}` });
            case "finance_news":
                return res.json({ type, userInput: gemResult.userinput, response: `Fetching latest finance news`, actionUrl: `https://www.google.com/search?q=finance news` });

            /** ===================== TRAVEL & BOOKING ===================== **/
            case "flight_status":
            case "book_flight":
            case "book_hotel":
                return res.json({ type, userInput: gemResult.userinput, response: `Searching travel info for "${gemResult.userinput}"`, actionUrl: `https://www.google.com/search?q=${encodeURIComponent(gemResult.userinput)}` });

            /** ===================== COMMUNICATION ===================== **/
            case "send_email":
            case "send_sms":
            case "call_contact":
                return res.json({ type, userInput: gemResult.userinput, response: gemResult.response });

            /** ===================== AI TOOLS ===================== **/
            case "ai_image_generate":
                return res.json({ type, userInput: gemResult.userinput, response: `Generating image for "${gemResult.userinput}"`, actionUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(gemResult.userinput)}` });

            case "document_summarize":
            case "code_generate": {
                const docUrl = createTempDoc(gemResult.userinput, true);
                return res.json({
                    type,
                    userInput: gemResult.userinput,
                    response: gemResult.response,
                    actionUrl: docUrl // ✅ Serve generated docs at /docs/:id
                });
            }

            /** ===================== DEFAULT (Fallback to Google) ===================== **/
            default:
                return res.json({
                    type: "google_search",
                    userInput: gemResult.userinput,
                    response: `Searching Google for "${gemResult.userinput}"`,
                    actionUrl: `https://www.google.com/search?q=${encodeURIComponent(gemResult.userinput)}`
                });
        }
    } catch (error) {
        console.error("Error in askToAssistant:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};
