import React from 'react'

function Card({ image }) {
    return (
        <div className='w-[200px] h-[300px] bg-[#030326] border-2 border-[blue] rounded-2xl'>
            <img src={image} className='h-full object-cover' />
        </div>
    )
}

export default Card
