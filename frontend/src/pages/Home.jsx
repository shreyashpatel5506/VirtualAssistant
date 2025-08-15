import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from './../Context/usercontext';
import { authStore } from '../storevalues/auth.store';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { users, setUsers, getGeminiResponse } = useContext(UserContext);
    const { getCurrentUser, logout } = authStore();
    const navigate = useNavigate();

    // Refs for recognition and state
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const transcriptRef = useRef('');
    const isProcessingRef = useRef(false);
    const assistantNameRef = useRef('');
    const getGeminiResponseRef = useRef(getGeminiResponse);

    // State for animation and mic control
    const [isListening, setIsListening] = useState(false);

    // Keep latest values in refs
    useEffect(() => {
        assistantNameRef.current = users?.assistantName || '';
        getGeminiResponseRef.current = getGeminiResponse;
    }, [users, getGeminiResponse]);

    // Fetch current user on load
    useEffect(() => {
        const fetchUser = async () => {
            const response = await getCurrentUser();
            if (response?.user) {
                setUsers(response.user);
            }
        };
        fetchUser();
    }, []);

    // Init speech recognition object
    const initRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("SpeechRecognition not supported in this browser.");
            return;
        }

        if (!recognitionRef.current) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (e) => {
                if (isProcessingRef.current) return;

                clearTimeout(silenceTimerRef.current);

                const newTranscript = Array.from(e.results)
                    .map(result => result[0].transcript)
                    .join('');

                transcriptRef.current = newTranscript; // ✅ no duplication

                console.log("Current speech:", transcriptRef.current);

                silenceTimerRef.current = setTimeout(() => {
                    const finalTranscript = transcriptRef.current.trim();
                    transcriptRef.current = ''; // reset for next phrase

                    console.log("Final recognized speech:", finalTranscript);

                    if (
                        assistantNameRef.current &&
                        finalTranscript.toLowerCase().includes(assistantNameRef.current.toLowerCase())
                    ) {
                        isProcessingRef.current = true;

                        // stop listening while processing
                        stopListening();

                        getGeminiResponseRef.current(finalTranscript)
                            .then(response => {
                                if (response) {
                                    console.log("Assistant says:", response.response);
                                    speak(response.response);
                                    if (response.actionUrl) {
                                        window.open(response.actionUrl, '_blank');
                                    }
                                }
                                isProcessingRef.current = false;
                            })
                            .catch(error => {
                                console.error("Error getting Gemini response:", error);
                                isProcessingRef.current = false;
                            });
                    }
                }, 500);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                isProcessingRef.current = false;
                if (event.error === 'network') {
                    setTimeout(() => {
                        if (isListening) startListening();
                    }, 1000);
                }
            };
        }
    };

    const startListening = () => {
        initRecognition();
        try {
            recognitionRef.current.start();
            setIsListening(true);
        } catch (err) {
            console.error("Failed to start recognition:", err);
        }
    };

    const stopListening = () => {
        try {
            recognitionRef.current.stop();
        } catch (err) {
            console.error("Failed to stop recognition:", err);
        }
        setIsListening(false);
    };

    const toggleListening = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const speak = (response) => {
        const utterance = new SpeechSynthesisUtterance(response);

        // Resume listening after speaking finishes
        utterance.onend = () => {
            startListening();
        };

        window.speechSynthesis.cancel(); // stop any ongoing speech
        window.speechSynthesis.speak(utterance);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#030353] flex flex-col justify-center items-center p-6">
            <h1 className='text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6'>
                Welcome to Your Virtual Assistant
            </h1>

            {/* Customize button */}
            <button
                className="fixed top-4 right-4 p-3 rounded-full pl-6 pr-6 
                bg-gradient-to-r from-cyan-400 to-blue-500
                text-black font-bold text-lg shadow-lg
                hover:shadow-[0_0_20px_rgba(0,255,255,0.7)]
                transition-all cursor-pointer"
                onClick={() => navigate('/customize')}
            >
                Customize Your Assistant
            </button>

            {/* Logout button */}
            <button
                className="fixed top-22 right-4 p-3 rounded-full pl-6 pr-6
                bg-gradient-to-r from-cyan-400 to-blue-500
                text-black font-bold text-lg shadow-lg
                hover:shadow-[0_0_20px_rgba(0,255,255,0.7)]
                transition-all cursor-pointer mt-16"
                onClick={handleLogout}
            >
                Logout
            </button>

            {/* Assistant Mic Button */}
            <div
                onClick={toggleListening}
                className={`relative rounded-full overflow-hidden cursor-pointer transition-all 
                    w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] lg:w-[250px] lg:h-[250px]
                    ${isListening ? 'animate-pulse-ring' : ''}`}
            >
                <img
                    src={users?.assistantImage}
                    alt="Assistant"
                    className="w-full h-full object-cover rounded-full"
                />
            </div>

            <h1 className='text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-6'>
                Hi, I'm {users?.assistantName || 'your assistant'}
            </h1>
        </div>
    );
};

export default Home;
