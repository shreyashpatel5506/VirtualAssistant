import React from 'react';

function Card({ image }) {
    return (
        <div className="w-[200px] h-[250px] bg-[#030326] border-2 border-blue-500 rounded-2xl overflow-hidden">
            <img src={image} alt="" className="w-full h-full object-cover" />
        </div>
    );
}

export default Card;
