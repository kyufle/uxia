import React, { useEffect, useState } from 'react';
import config from '../config';

export function ExpoDetailView({ seleccionado, isDarkMode, hasConsent }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function chargeData() {
            // SI NO HAY CONTENIDO O NO HAY SELECCIÓN, SALIMOS
            if (!hasConsent || !seleccionado) return;
            
            setLoading(true);
            try {
                // Corregido: Endpoint coincide con tu urls.py de Django
                const response = await fetch(`${config.API_URL}/api/items_expo/${seleccionado}/`);
                if (!response.ok) throw new Error(`Status: ${response.status}`);
                const data = await response.json();

                if (data && data.length > 0) {
                    const cleanItems = data
                        .filter(item => item.name !== "") 
                        .map(item => ({
                            ...item,
                            // Limpiamos el nombre para mostrarlo bonito
                            name: item.name.replaceAll('-', ' '),
                            description: item.description || "Sense descripció."
                        }));
                    setItems(cleanItems);
                } else {
                    setItems([]);
                }
            } catch (error) {
                console.error("Error en ExpoDetailView:", error);
                setItems([]);
            } finally {
                setLoading(false);
            }
        }
        chargeData();
    }, [seleccionado, hasConsent]);

    // 1. BLOQUEO TOTAL: Consentimiento
    if (!hasConsent) {
        return (
            <div className={`p-10 text-center ${isDarkMode ? "text-red-400" : "text-red-600"} font-bold`}>
                Accés denegat: No hi ha contingut disponible.
            </div>
        );
    }

    // 2. BLOQUEO DE SELECCIÓN
    if (!seleccionado) return (
        <div className={`p-10 text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"} italic`}>
            Selecciona una exposició per gestionar els ítems...
        </div>
    );

    // 3. ESTADO DE CARGA
    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDarkMode ? "border-orange-300" : "border-blue-900"}`}></div>
        </div>
    );

    return (
        <div className={`w-full min-h-screen p-6 ${isDarkMode ? "bg-[#121212]" : "bg-gray-50"}`}>
            {/* Header del Admin */}
            <div className="mb-8 border-b pb-4 flex justify-between items-end">
                <div>
                    <h1 className={`text-2xl font-bold uppercase ${isDarkMode ? "text-orange-300" : "text-[#162354]"}`}>
                        Admin: {seleccionado.replaceAll('-', ' ')}
                    </h1>
                    <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Total: {items.length} ítems en llista
                    </p>
                </div>
            </div>

            {/* Grid Quadrícula Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                    <div 
                        key={item.id} 
                        className={`flex flex-col rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-[1.02] ${
                            isDarkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-gray-200"
                        }`}
                    >
                        {/* Imagen Principal Corregida */}
                        <div className="relative h-48 w-full">
                            <img
                                src={`${config.API_URL}${item.featured_image}`}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                            />
                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-md uppercase font-bold">
                                ID: {item.id}
                            </div>
                        </div>

                        <div className="p-4 flex-grow">
                            <h3 className={`text-lg font-bold uppercase truncate ${isDarkMode ? "text-blue-100" : "text-blue-950"}`}>
                                {item.name}
                            </h3>
                            <p className={`mt-1 text-xs line-clamp-2 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {item.description}
                            </p>
                        </div>

                        {/* Galería Corregida (Mapeo de Objetos) */}
                        <div className={`p-4 pt-0 flex flex-row gap-2 overflow-hidden`}>
                            {item.images && item.images.slice(0, 3).map((imgObj, idx) => (
                                <img
                                    key={imgObj.id || idx}
                                    src={`${config.API_URL}${imgObj.url}`}
                                    alt="gallery"
                                    className="h-12 w-12 object-cover rounded-lg border border-gray-500/20"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            ))}
                            {item.images?.length > 3 && (
                                <div className={`h-12 w-12 flex items-center justify-center rounded-lg text-xs font-bold ${
                                    isDarkMode ? "bg-zinc-800 text-gray-400" : "bg-gray-100 text-gray-500"
                                }`}>
                                    +{item.images.length - 3}
                                </div>
                            )}
                        </div>

                        <div className={`p-3 flex justify-end gap-2 border-t ${isDarkMode ? "border-zinc-800" : "border-gray-100"}`}>
                            <button className="text-[10px] uppercase font-bold px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                Editar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && !loading && (
                <div className={`mt-20 text-center ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    No s'han trobat ítems per a aquesta exposició.
                </div>
            )}
        </div>
    );
}

export default ExpoDetailView;