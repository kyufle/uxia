import React, { useState } from 'react';
import izquierda from '../assets/chevron-izquierdo.png'
import derecha from '../assets/chevron-derecho.png'
function Carrousel({ photos }) {
    const [indexPhoto, setIndexPhoto] = useState(0);
    const length = photos?.length;

    if (!Array.isArray(photos) || length === 0) return null;

    const nextPhoto = () => {
        setIndexPhoto(indexPhoto === length - 1 ? 0 : indexPhoto + 1);
    };

    const prevPhoto = () => {
        setIndexPhoto(indexPhoto === 0 ? length - 1 : indexPhoto - 1);
    };

    return (
        <div className='w-full h-full flex flex-row justify-center items-center relative'>
            <button onClick={prevPhoto} className="px-4 py-4 bg-blue-950 rounded-l-lg">
                <img 
                    src={izquierda} 
                    alt={izquierda} 
                    className="w-5 h-5 brightness-0 invert"
                />
            </button>

            <div className="flex justify-center items-center">
                {photos.map((photo, index) => {
                    return (
                        <div key={index}>
                            {indexPhoto === index && (
                                <img 
                                    src={photo} 
                                    alt={`photo-${index}`} 
                                    className="max-w-full h-auto rounded-sm"
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            <button onClick={nextPhoto} className="px-4 py-4 bg-blue-950 rounded-r-lg">
                <img 
                    src={derecha} 
                    alt="Siguiente" 
                    className="w-5 h-5 brightness-0 invert"
                />
            </button>
        </div>
    );
}

export default Carrousel;