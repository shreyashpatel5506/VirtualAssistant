import React, { useContext } from 'react'
import { UserContext } from './../Context/usercontext';
import Customize from './Customize';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { users } = useContext(UserContext);
    const navigate = useNavigate();
    return (
        <div className="w-full min-h-screen bg-gradient-to-t from-black to-[#030353] flex flex-col justify-center items-center p-6">
            <h1 className='text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6'>Welcome to Your Virtual Assistant</h1>
            <div
                className="fixed top-4 right-4 p-3 rounded-full 
             bg-gradient-to-r from-cyan-400 to-blue-500
             text-black font-bold text-lg shadow-lg
             hover:shadow-[0_0_20px_rgba(0,255,255,0.7)]
             transition-all cursor-pointer"
                onClick={() => { () => navigate('/customize') }}
            >
                Customize
            </div>

            <div className='bg-[#030326] border-2 border-blue-500 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:rotate-1 hover:shadow-[0_10px_25px_rgba(0,0,255,0.5)] cursor-pointer
            w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] md:w-[200px] md:h-[200px] lg:w-[300px] lg:h-[300px] mx-auto'>
                <img src={users?.assistantImage} alt="AssistantImage" className="w-full h-full object-cover" />
            </div>
            <h1 className='text-white text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-6'>
                <p>Hii, I'm {users?.assistantName}</p>
            </h1>
        </div>
    )
    console.log(users?.assistantName, users?.assistantImage);
}

export default Home