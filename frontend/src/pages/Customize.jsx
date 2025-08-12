import React, { useState, useRef, useContext } from "react";
import Card from "../components/Card.jsx";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/authBg.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";
import { ImagePlus } from "lucide-react";
import { UserContext } from "../Context/usercontext";

function Customize() {
    const { selectedAssistant, setSelectedAssistant } = useContext(UserContext);
    const [visibleImage, setVisibleImage] = useState(selectedAssistant);
    const inputImageRef = useRef();

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVisibleImage(reader.result);
                setSelectedAssistant(reader.result); // Save in context
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCardSelect = (image) => {
        setSelectedAssistant(image);
        setVisibleImage(image);
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#030353] flex flex-col justify-center items-center gap-5 p-4">
            <h1 className="text-white text-2xl">
                Select your <span className="text-cyan-300 text-4xl">Virtual Assistant</span>
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 max-w-7xl w-full">
                {[image1, image2, image3, image4, image5, image6, image7].map((img, index) => (
                    <div key={index} onClick={() => handleCardSelect(img)}>
                        <Card image={img} />
                    </div>
                ))}

                {/* Upload button */}
                <div
                    className="bg-[#030326] border-2 border-blue-500 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:rotate-1 hover:shadow-[0_10px_25px_rgba(0,0,255,0.5)] cursor-pointer flex items-center justify-center 
                        w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] lg:w-[250px] lg:h-[250px] mx-auto"
                    onClick={() => inputImageRef.current.click()}
                >
                    {visibleImage ? (
                        <img src={visibleImage} alt="Uploaded" className="w-full h-full object-cover" />
                    ) : (
                        <ImagePlus className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" color="#ffffff" />
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        ref={inputImageRef}
                        hidden
                        onChange={handleImageUpload}
                    />
                </div>
            </div>

            <button className="mt-4 py-7 px-12 rounded-full bg-white text-black transition">
                <span className="font-bold text-2xl">Confirm Selection</span>
            </button>
        </div>
    );
}

export default Customize;
