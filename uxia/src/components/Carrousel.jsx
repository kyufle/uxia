import React, { useEffect, useState, useRef } from 'react';
import izquierda from '../assets/chevron-izquierdo.png'
import derecha from '../assets/chevron-derecho.png'

function Carrousel({ seleccionado }) {
    const [indexPhoto, setIndexPhoto] = useState(0);
    const [cars, setCars] = useState([]);
    const [showInfo, setShowInfo] = useState(false);
    const [tempImage, setTempImage] = useState(null); // Estado para la imagen ampliada en el menú
    const touchStartY = useRef(null);

    useEffect(() => {
        async function chargeCarsExpo() {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/coches_expo/?expo=${seleccionado}`);
                if (!response.ok) throw new Error(`Status: ${response.status}`);
                const data = await response.json();
                setCars(data);
                setIndexPhoto(0);
            } catch (error) {
                console.error(error.message);
            }
        }
        chargeCarsExpo();
    }, [seleccionado]);

    const currentCar = cars[indexPhoto];
    const totalCars = cars.length;

    // Al abrir el menú, reseteamos la imagen temporal a la principal del coche
    const handleInfo = () => {
        setTempImage(currentCar.image);
        setShowInfo(true);
    };

    const closeMenu = () => setShowInfo(false);

    const onTouchStart = (e) => { touchStartY.current = e.targetTouches[0].clientY; };
    const onTouchMove = (e) => {
        if (touchStartY.current === null) return;
        const diff = touchStartY.current - e.targetTouches[0].clientY;
        if (diff > 50) { closeMenu(); touchStartY.current = null; }
    };

    if (totalCars === 0) return <div className="p-10 text-center text-gray-400 italic">Cargando coches...</div>;

    return (
        <div className='w-full h-full flex flex-row justify-center items-center relative overflow-hidden'>
            <div
                className={`fixed inset-0 bg-black/60 transition-opacity duration-300 ${showInfo ? 'opacity-100 z-40' : 'opacity-0 pointer-events-none z-0'}`}
                onClick={closeMenu}
            />

            {/* Panel Desplegable */}
            <div
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                className={`fixed top-0 left-0 w-full bg-white z-50 transition-transform duration-500 ease-in-out transform rounded-b-3xl max-h-[90vh] overflow-y-auto
                    ${showInfo ? 'translate-y-0 shadow-2xl' : '-translate-y-full'}`}
            >
                <div className="p-6 flex flex-col items-center">
                    {currentCar && (
                        <>
                            {/* --- FOTO GRANDE DEL MENÚ (Cambia dinámicamente) --- */}
                            <div className="w-full max-w-sm mb-4">
                                <img 
                                    src={`http://127.0.0.1:8000${tempImage || currentCar.image}`} 
                                    alt={currentCar.name} 
                                    className="w-full h-56 object-cover rounded-2xl shadow-md transition-all duration-300"
                                />
                            </div>

                            <div className="text-center w-full max-w-md text-blue-950 gap-1 flex flex-col mb-4">
                                <h3 className="text-xl font-bold uppercase">{currentCar.name}</h3>
                                <p className="text-gray-600 text-xs">{currentCar.description || "Sin descripción."}</p>
                            </div>

                            {/* Galería con OnClick */}
                            {currentCar.images && currentCar.images.length > 0 && (
                                <div className="w-full max-w-sm mt-2 px-2">
                                    <h4 className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Toca para ampliar</h4>
                                    <div className="flex flex-row gap-2 overflow-x-auto pb-4 no-scrollbar"> 
                                        {/* Incluimos también la principal en la galería por si quieren volver a ella */}
                                        <img 
                                            src={`http://127.0.0.1:8000${currentCar.image}`}
                                            onClick={() => setTempImage(currentCar.image)}
                                            className={`h-20 w-20 flex-shrink-0 object-cover rounded-lg border-2 transition-all ${tempImage === currentCar.image ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                                        />
                                        
                                        {currentCar.images.map((imgUrl, idx) => (
                                            <img 
                                                key={idx}
                                                src={`http://127.0.0.1:8000${imgUrl}`}
                                                alt={`Vista ${idx}`}
                                                onClick={() => setTempImage(imgUrl)} // <--- AQUÍ CAMBIA LA FOTO
                                                className={`h-20 w-20 flex-shrink-0 object-cover rounded-lg border-2 transition-all cursor-pointer ${tempImage === imgUrl ? 'border-blue-500 scale-110' : 'border-transparent'}`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                    <div className="mt-2 w-10 h-1 bg-gray-200 rounded-full cursor-pointer" onClick={closeMenu}></div>
                </div>
            </div>

            {/* Resto del Carrusel Principal (Igual) */}
            <button
                onClick={() => setIndexPhoto(indexPhoto === 0 ? totalCars - 1 : indexPhoto - 1)}
                className="absolute left-2 p-4 bg-white/10 backdrop-blur-md rounded-full z-30"
            >
                <img src={izquierda} alt="Prev" className="w-5 h-5 brightness-0 invert" />
            </button>

            <div className="flex justify-center items-center w-full h-full">
                {cars.map((photo, index) => (
                    indexPhoto === index && (
                        <img
                            key={photo.id || index}
                            src={`http://127.0.0.1:8000${photo.image}`}
                            alt={photo.name}
                            className="w-full h-auto object-cover rounded-xl cursor-pointer"
                            onClick={handleInfo}
                        />
                    )
                ))}
            </div>
            <button
                onClick={() => setIndexPhoto(indexPhoto === totalCars - 1 ? 0 : indexPhoto + 1)}
                className="absolute right-2 p-4 bg-white/10 backdrop-blur-md rounded-full z-30"
            >
                <img src={derecha} alt="Next" className="w-5 h-5 brightness-0 invert" />
            </button>
        </div>
    );
}

export default Carrousel;