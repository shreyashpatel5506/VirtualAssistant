import React from 'react'
import bg from '../assets/authBg.png';
const Signup = () => {
    return (
        <div
            className="w-full h-[100vh] bg-cover flex"
            style={{
                backgroundImage: `url(${bg})`
            }}
        >
            <form className="w-full max-w-md m-auto bg-#ffffff p-8 rounded-lg shadow-lg backdrop-blur-2xl h-[500px] flex flex-col justify-center box-shadow">
            </form>
        </div>
    );
}

export default Signup