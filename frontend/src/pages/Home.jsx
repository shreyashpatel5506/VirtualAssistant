import React, { useContext, useEffect, useRef, useState } from 'react';
import { UserContext } from './../Context/usercontext';
import { authStore } from '../storevalues/auth.store';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
    const { users, setUsers, getGeminiResponse } = useContext(UserContext);
    const { getCurrentUser, logout } = authStore();
    const navigate = useNavigate();

    // Refs for recognition and state
    const recognitionRef = useRef(null);
    const silenceTimerRef = useRef(null);
    const transcriptRef = useRef('');
    const isProcessingRef = useRef(false);
    const getGeminiResponseRef = useRef(getGeminiResponse);

    // State
    const [isListening, setIsListening] = useState(false);
    const [command, setCommand] = useState('');
    const [assistantResponse, setAssistantResponse] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [showResponse, setShowResponse] = useState(false);

    // Keep latest function in ref
    useEffect(() => {
        getGeminiResponseRef.current = getGeminiResponse;
    }, [getGeminiResponse]);

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

            recognitionRef.current.onstart = () => {
                setIsListening(true);
            };

            recognitionRef.current.onend = () => {
                if (!isProcessingRef.current) {
                    setIsListening(false);
                }
            };

            recognitionRef.current.onresult = (e) => {
                if (isProcessingRef.current) return;

                clearTimeout(silenceTimerRef.current);

                const newTranscript = Array.from(e.results)
                    .map(result => result[0].transcript)
                    .join('');

                transcriptRef.current = newTranscript;
                setCommand(transcriptRef.current);

                silenceTimerRef.current = setTimeout(() => {
                    const finalTranscript = transcriptRef.current.trim();
                    if (!finalTranscript) return;

                    transcriptRef.current = '';
                    setCommand(finalTranscript);
                    isProcessingRef.current = true;
                    stopListening();

                    getGeminiResponseRef.current(finalTranscript)
                        .then(response => {
                            if (response) {
                                console.log("Assistant says:", response.response);
                                setAssistantResponse(response.response);
                                setShowResponse(true);
                                speak(response.response);
                                if (response.actionUrl) {
                                    setTimeout(() => {
                                        window.open(response.actionUrl, '_blank');
                                    }, 1000);
                                }
                            }
                            isProcessingRef.current = false;
                        })
                        .catch(error => {
                            console.error("Error getting Gemini response:", error);
                            isProcessingRef.current = false;
                        });
                }, 1000);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                isProcessingRef.current = false;
                setIsListening(false);
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
            setShowResponse(false);
        } catch (err) {
            console.error("Failed to start recognition:", err);
        }
    };

    const stopListening = () => {
        try {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
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

    const speak = (text) => {
        setIsSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => {
            setIsSpeaking(false);
            startListening();
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
        };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#030353] flex flex-col justify-center items-center p-6 relative overflow-hidden">
            {/* Background animated particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-blue-500 opacity-20"
                        initial={{
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            width: Math.random() * 10 + 5,
                            height: Math.random() * 10 + 5,
                        }}
                        animate={{
                            x: [null, Math.random() * window.innerWidth],
                            y: [null, Math.random() * window.innerHeight],
                        }}
                        transition={{
                            duration: Math.random() * 20 + 10,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "linear",
                        }}
                    />
                ))}
            </div>

            <h1 className='text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 z-10'>
                Welcome to Your Virtual Assistant
            </h1>

            {/* Customize button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed top-4 right-4 p-3 rounded-full pl-6 pr-6 
                bg-gradient-to-r from-cyan-400 to-blue-500
                text-black font-bold text-lg shadow-lg
                hover:shadow-[0_0_20px_rgba(0,255,255,0.7)]
                transition-all cursor-pointer z-10"
                onClick={() => navigate('/customize')}
            >
                Customize Your Assistant
            </motion.button>

            {/* Logout button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed top-22 right-4 p-3 rounded-full pl-6 pr-6
                bg-gradient-to-r from-cyan-400 to-blue-500
                text-black font-bold text-lg shadow-lg
                hover:shadow-[0_0_20px_rgba(0,255,255,0.7)]
                transition-all cursor-pointer mt-16 z-10"
                onClick={handleLogout}
            >
                Logout
            </motion.button>

            {/* Assistant Avatar with Animation */}
            <div className="relative z-10 flex flex-col items-center">
                <motion.div
                    onClick={toggleListening}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative rounded-full overflow-hidden cursor-pointer 
                        w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] md:w-[220px] md:h-[220px] lg:w-[250px] lg:h-[250px]
                        border-4 ${isListening ? 'border-cyan-400' : 'border-blue-500'}`}
                    animate={{
                        boxShadow: isListening
                            ? '0 0 20px rgba(0, 255, 255, 0.7)'
                            : '0 0 10px rgba(0, 100, 255, 0.5)'
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <img
                        src={users?.assistantImage}
                        alt="Assistant"
                        className="w-full h-full object-cover rounded-full"
                    />

                    {/* Listening animation */}
                    {isListening && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute rounded-full bg-cyan-400 opacity-20 animate-ping"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    animationDuration: '2s'
                                }}
                            />
                        </div>
                    )}

                    {/* Mic icon overlay */}
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 rounded-full p-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={isListening ? "#ff0000" : "#ffffff"}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            {isListening ? (
                                <>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                    <line x1="6" y1="18" x2="18" y2="6"></line>
                                </>
                            ) : (
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                            )}
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                            <line x1="12" y1="19" x2="12" y2="23"></line>
                            <line x1="8" y1="23" x2="16" y2="23"></line>
                        </svg>
                    </div>
                </motion.div>

                <h1 className='text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-6'>
                    Hi, I'm {users?.assistantName || 'your assistant'}
                </h1>

                {/* Command display */}
                <AnimatePresence>
                    {command && (
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-cyan-300 text-lg mt-2 italic"
                        >
                            "{command}"
                        </motion.p>
                    )}
                </AnimatePresence>

                {/* Assistant response */}
                <AnimatePresence>
                    {showResponse && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mt-4 p-4 bg-blue-900 bg-opacity-50 rounded-lg max-w-md"
                        >
                            <div className="flex items-start">
                                <div className="flex-shrink-0 mr-3">
                                    <div className="relative">
                                        <img
                                            src={users?.assistantImage}
                                            alt="Assistant"
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        {isSpeaking && (
                                            <div className="absolute -inset-1 rounded-full bg-cyan-400 animate-pulse opacity-30"></div>
                                        )}
                                    </div>
                                </div>
                                <div className="text-white">
                                    <p>{assistantResponse}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Home;