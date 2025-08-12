import React, { useState, useContext } from "react";
import Card from "../components/Card";
import { UserContext } from "../Context/usercontext";
import { useNavigate } from "react-router-dom";

const Customize2 = () => {
    const { selectedAssistant, users } = useContext(UserContext);
    const navigate = useNavigate();
    const [assistantName, setAssistantName] = useState(users?.assistantName || "");

    return (
        <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#030353] flex flex-col justify-center items-center p-6">
            <h1 className="text-white text-4xl font-bold mb-10 text-center">
                Customize Your <span className="text-cyan-300">Virtual Assistant</span>
            </h1>

            {/* Selected Assistant Section */}
            <div className="flex flex-col gap-6 items-center w-full max-w-md">
                <h2 className="text-white text-2xl">Selected Assistant</h2>
                <div className="w-56 h-56 rounded-3xl bg-white/10 border border-cyan-300 backdrop-blur-lg shadow-[0_0_25px_rgba(0,255,255,0.4)] flex items-center justify-center">
                    {selectedAssistant ? (
                        <Card image={selectedAssistant} />
                    ) : (
                        <span className="text-gray-400 text-lg">No Assistant Selected</span>
                    )}
                </div>

                {/* Name Input */}
                <input
                    type="text"
                    placeholder="Enter Assistant name e.g. John"
                    className="w-full mt-4 p-4 rounded-full bg-white/10 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 backdrop-blur-md text-lg"
                    onChange={(e) => setAssistantName(e.target.value)}
                    value={assistantName}
                />

                {/* Create Button */}
                {assistantName && (
                    <button
                        className="mt-6 w-full py-4 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-lg shadow-lg hover:shadow-[0_0_20px_rgba(0,255,255,0.7)] transition-all"
                        onClick={() => navigate("/customize2")}
                    >
                        Finally Create Your Assistant
                    </button>
                )}
            </div>
        </div>
    );
};

export default Customize2;
