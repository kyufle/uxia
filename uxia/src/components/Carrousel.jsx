import React, { useEffect, useState } from 'react';
import izquierda from '../assets/chevron-izquierdo.png'
import derecha from '../assets/chevron-derecho.png'
function Carrousel({ seleccionado }) {
    const [indexPhoto, setIndexPhoto] = useState(0);
    // const length = photos?.length;
    const [cars, setCars] = useState([]);
    useEffect(()=>{
            async function chargeCarsExpo(){
                try{
                    const response = await fetch(`http://127.0.0.1:8000/api/coches_expo/?expo=${seleccionado}`);
                    if(!response.ok){
                         throw new Error(`Response status: ${response.status}`);
                    }
                    const data = await response.json();
                    console.log(data);
                    setCars(data);
                } catch(error){
                    console.error(error.message);
                } 
            }
            chargeCarsExpo();
        },[seleccionado])

    const totalCars = cars.length;

    if (totalCars === 0) {
        return <p className="text-gray-400 italic">Selecciona una expo per veure los coches...</p>;
    }

    const nextPhoto = () => {
        setIndexPhoto(indexPhoto === totalCars - 1 ? 0 : indexPhoto + 1);
    };

    const prevPhoto = () => {
        setIndexPhoto(indexPhoto === 0 ? totalCars - 1 : indexPhoto - 1);
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
                {cars.map((photo, index) => {
                    return (
                        <div key={index}>
                            {indexPhoto === index && (
                                <img 
                                    src={`http://127.0.0.1:8000${photo.image}`}
                                    alt={`photo-${photo.name}`} 
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