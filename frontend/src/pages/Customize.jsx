import React from "react";
import Card from "../components/Card.jsx";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/authBg.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";
import { ImagePlus } from "lucide-react";

function Customize() {
    return (
        <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#030353] flex justify-center items-center p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 max-w-7xl w-full">
                <Card image={image1} />
                <Card image={image2} />
                <Card image={image3} />
                <Card image={image4} />
                <Card image={image5} />
                <Card image={image6} />
                <Card image={image7} />
                <div className="bg-[#030326] border-2 border-blue-500 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:rotate-1 hover:shadow-[0_10px_25px_rgba(0,0,255,0.5)] cursor-pointer flex items-center justify-center 
                    w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] lg:w-[250px] lg:h-[250px] mx-auto">
                    <ImagePlus className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" color="#ffffff" />
                </div>
            </div>
        </div>
    );
}

export default Customize;
