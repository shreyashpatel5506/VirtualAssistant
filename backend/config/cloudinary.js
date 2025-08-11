import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

const uploadOnCloudinary = async (filePath) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    try {
        const result = await cloudinary.uploader.upload(filePath);
        fs.unlinkSync(filePath); // Remove the file after upload
        return result.secure_url;
    } catch (error) {
        fs.unlinkSync(filePath); // Ensure the file is removed even if upload fails
        console.error("Error uploading to Cloudinary:", error);
        return resizeBy.status(500).json({
            message: "Error uploading file"
        })

    }
}

export default uploadOnCloudinary;
