import React from 'react';

function Card({ image }) {
    return (
        <div className="w-[250px] h-[250px] bg-[#030326] border-2 border-blue-500 rounded-2xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:rotate-1 hover:shadow-[0_10px_25px_rgba(0,0,255,0.5)] cursor-pointer">
            <img src={image} alt="" className="w-full h-full object-cover" />
        </div>
    );
}

export default Card;
