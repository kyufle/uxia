import React, { useEffect, useState, useRef } from 'react';
import izquierda from '../assets/chevron-izquierdo.png'
import derecha from '../assets/chevron-derecho.png'
import config from '../config'

function Carrousel({ seleccionado, isDarkMode }) {
    const [indexPhoto, setIndexPhoto] = useState(0);
    const [cars, setCars] = useState([]);
    const [showInfo, setShowInfo] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const touchStartY = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        async function chargeData() {
            if (!seleccionado) {
                setCars([]);
                return;
            }
            
            try {
                const response = await fetch(`${config.API_URL}/api/expo/?search=${seleccionado}`);
                if (!response.ok) throw new Error(`Status: ${response.status}`);
                const data = await response.json();

                if (data.length > 0) {
                    const cleanData = data.map(car => ({
                        ...car,
                        name: car.name.replaceAll('-', ' '),
                        expo: car.expo.replaceAll('-', ' ')
                    }));

                    const targetIndex = cleanData.findIndex(car => car.name.toLowerCase() === seleccionado.toLowerCase());

                    if (targetIndex !== -1) {
                        setCars(cleanData);
                        setIndexPhoto(targetIndex);
                    } else {
                        const filteredByExpo = cleanData.filter(car => car.expo.toLowerCase() === seleccionado.toLowerCase());
                        setCars(filteredByExpo);
                        setIndexPhoto(0);
                    }
                }
            } catch (error) {
                console.error("Tipo de error:", e.name); 
                console.error("Detalle completo:", e);
            }
        }
        chargeData();
    }, [seleccionado]);
    const currentCar = cars[indexPhoto];
    const totalCars = cars.length;
    const handleInfo = () => {
        if (currentCar) {
            setTempImage(currentCar.image);
            setShowInfo(true);
        }
    };

    const closeMenu = () => setShowInfo(false);
    const onTouchStart = (e) => { touchStartY.current = e.targetTouches[0].clientY; };
    const onTouchMove = (e) => {
        if (touchStartY.current === null) return;
        const diff = touchStartY.current - e.targetTouches[0].clientY;
        if (diff > 50) { closeMenu(); touchStartY.current = null; }
    };

    if (totalCars === 0) return <div className={`p-10 text-center ${isDarkMode ? "text-gray-100" : "text-gray-400"} italic`}>Busca una expo o un cotxe...</div>;

    return (
        <div className='w-full h-full flex flex-row justify-center items-center relative overflow-hidden'>
            <div
                className={`fixed inset-0 ${ isDarkMode ? "bg-white/60" : "bg-black/60"} transition-opacity duration-300 ${showInfo ? 'opacity-100 z-40' : 'opacity-0 pointer-events-none z-0'}`}
                onClick={closeMenu}
            />
            <div
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                className={`fixed top-0 left-0 w-full ${ isDarkMode ? "bg-black" : "bg-white"} z-50 transition-transform duration-500 ease-in-out transform rounded-b-3xl max-h-[90vh] overflow-y-auto
                    ${showInfo ? 'translate-y-0 shadow-2xl' : '-translate-y-full'}`}
            >
                <div className="p-6 flex flex-col items-center">
                    {currentCar && (
                        <>
                            <div className="w-full max-w-sm mb-4">
                                <img
                                    src={`${config.API_URL}${tempImage || currentCar.image}`}
                                    alt={currentCar.name}
                                    className="w-full h-56 object-cover rounded-2xl shadow-md transition-all duration-300"
                                />
                            </div>
                            <div className={`text-center w-full max-w-md ${ isDarkMode ? "text-blue-100" : "text-blue-950"} gap-1 flex flex-col mb-4`}>
                                <h3 className="text-xl font-bold uppercase">{currentCar.name.replaceAll('-', ' ')}</h3>
                                <p className={`${isDarkMode ? "text-orange-300" : "text-gray-600"} text-xs`}>{currentCar.description.replaceAll('-', ' ') || "Sense descripció."}</p>
                            </div>
                            {currentCar.images && currentCar.images.length > 0 && (
                                <div className="w-full max-w-sm mt-2 px-2">
                                    <h4 className={`text-[10px] font-bold ${isDarkMode ? "text-gray-100" : "text-gray-400"} mb-2 uppercase tracking-widest`}>Més fotos</h4>
                                    <div ref={scrollRef} className="flex flex-row gap-2 overflow-x-auto pb-4 no-scrollbar">
                                        <img
                                            src={`${config.API_URL}${currentCar.image}`}
                                            onClick={() => setTempImage(currentCar.image)}
                                            className={`h-20 w-20 flex-shrink-0 object-cover rounded-lg border-2 transition-all ${(!tempImage || tempImage === currentCar.image) ? 'border-blue-500 scale-110' : 'border-transparent'}`}
                                        />
                                        {currentCar.images.filter(img => img !== currentCar.image).map((imgUrl, idx) => (
                                            <img
                                                key={idx}
                                                src={`${config.API_URL}${imgUrl}`}
                                                onClick={() => setTempImage(imgUrl)}
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
            <div className="absolute top-12 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium z-30">
                {indexPhoto + 1} / {totalCars}
            </div>

            <button
                onClick={() => setIndexPhoto(indexPhoto === 0 ? totalCars - 1 : indexPhoto - 1)}
                className="absolute left-0 p-4 bg-white/10 backdrop-blur-md rounded-full z-30"
            >
                <img src={izquierda} alt="Prev" className="w-5 h-5 brightness-0 invert" />
            </button>

            <div className="flex justify-center items-center w-full h-full">
                {currentCar && (
                    <div key={currentCar.id} className="flex flex-col w-full px-4">
                        <h3 className={`text-xl font-bold uppercase ${isDarkMode ? "text-orange-300" : "text-[#162354]"} mb-2`}>
                            {currentCar.name.replaceAll('-', ' ')}
                        </h3>
                        <img
                            src={`${config.API_URL}${currentCar.image}`}
                            alt={currentCar.name}
                            className="w-full h-[275px] object-cover rounded-xl cursor-pointer shadow-lg"
                            onClick={handleInfo}
                        />
                    </div>
                )}
            </div>

            <button
                onClick={() => setIndexPhoto(indexPhoto === totalCars - 1 ? 0 : indexPhoto + 1)}
                className="absolute right-0 p-4 bg-white/10 backdrop-blur-md rounded-full z-30"
            >
                <img src={derecha} alt="Next" className="w-5 h-5 brightness-0 invert" />
            </button>
        </div>
    );
}

export default Carrousel;
