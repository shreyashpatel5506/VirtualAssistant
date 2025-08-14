import React, { useContext, useEffect } from 'react';
import { UserContext } from './../Context/usercontext';
import { authStore } from '../storevalues/auth.store';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { users, setUsers } = useContext(UserContext);
    const { getCurrentUser, logout } = authStore(); // ✅ call once at top
    const navigate = useNavigate();

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            let finalTranscript = '';

            recognition.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const text = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += text + ' ';
                    } else {
                        interimTranscript += text;
                    }
                }
                console.clear();
                console.log("Final Transcript:", finalTranscript.trim());
                console.log("Interim Transcript:", interimTranscript);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    recognition.stop(); // prevent restart loop if mic denied
                }
            };

            recognition.onend = () => {
                console.log("Recognition ended. Restarting...");
                recognition.start(); // auto-restart for "infinite" listening
            };

            recognition.start();
        } else {
            console.error("SpeechRecognition not supported in this browser.");
        }

        const fetchUser = async () => {
            const response = await getCurrentUser();
            if (response?.user) {
                setUsers(response.user);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        logout();
        window.location.reload();
        navigate('/login');

    };



    return (
        <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#030353] flex flex-col justify-center items-center p-6">
            <h1 className='text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6'>
                Welcome to Your Virtual Assistant
            </h1>

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

            <button
                className="fixed top-22 right-4 p-3 rounded-full  pl-6 pr-6
                bg-gradient-to-r from-cyan-400 to-blue-500
                text-black font-bold text-lg shadow-lg
                hover:shadow-[0_0_20px_rgba(0,255,255,0.7)]
                transition-all cursor-pointer"
                onClick={handleLogout}
            >
                Logout
            </button>

            <div className='bg-[#030326] border-2 border-blue-500 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:rotate-1 hover:shadow-[0_10px_25px_rgba(0,0,255,0.5)] cursor-pointer
                w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] lg:w-[300px] lg:h-[300px] mx-auto'>
                <img src={users?.assistantImage} alt="Assistant" className="w-full h-full object-cover" />
            </div>

            <h1 className='text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-6'>
                Hii, I'm {users?.assistantName}
            </h1>
        </div>
    );
};

export default Home;
