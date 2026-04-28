import React, { useEffect, useState, useCallback } from 'react';
import config from '../config';
import { EditItemModal } from './EditItemModal';

export function ExpoDetailView({ seleccionado, isDarkMode, hasConsent }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);

    const chargeData = useCallback(async () => {
        if (!hasConsent || !seleccionado) return;
        
        setLoading(true);
        try {
            const response = await fetch(`${config.API_URL}/api/items_expo/${seleccionado}/`);
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            const data = await response.json();
            console.log("Datos recibidos:", data); // Para verificar que 'images' trae las URLs

            if (data && data.length > 0) {
                const cleanItems = data
                    .filter(item => item.name !== "") 
                    .map(item => ({
                        ...item,
                        name: item.name.replaceAll('-', ' '),
                        // Usamos la descripción corta que ya genera tu serializer
                        displayDescription: item.short_description || "Sense descripció."
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
    }, [seleccionado, hasConsent]);

    useEffect(() => {
        chargeData();
    }, [chargeData]);

    // Función auxiliar para formatear URLs de imagen
    const getFullUrl = (path) => {
        if (!path) return 'https://via.placeholder.com/400x300?text=No+Image';
        if (path.startsWith('http')) return path;
        return `${config.API_URL}${path}`;
    };

    if (!hasConsent) return <div className="p-10 text-center text-red-600 font-bold">Accés denegat.</div>;
    if (!seleccionado) return <div className="p-10 text-center italic">Selecciona una exposició...</div>;
    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-900"></div></div>;

    return (
        <div className={`w-full min-h-screen p-6 ${isDarkMode ? "bg-[#121212]" : "bg-gray-50"}`}>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map((item) => (
                    <div key={item.id} className={`flex flex-col rounded-2xl overflow-hidden shadow-lg border transition-all hover:scale-[1.02] ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}`}>
                        
                        {/* 1. IMAGEN PRINCIPAL */}
                        <div className="relative h-44 w-full bg-black/20">
                            <img 
                                src={getFullUrl(item.featured_image)} 
                                alt={item.name} 
                                className="w-full h-full object-cover" 
                            />
                        </div>

                        {/* 2. MINIATURAS DE LA GALERÍA (propiedad 'images' del log) */}
                        <div className={`flex gap-1.5 p-2 overflow-x-auto scrollbar-hide border-b ${isDarkMode ? "bg-zinc-950/50 border-zinc-800" : "bg-gray-100/50 border-gray-200"}`}>
                            {item.images && item.images.length > 0 ? (
                                item.images.map((img) => (
                                    <div key={img.id} className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-black/10 shadow-sm bg-zinc-800">
                                        <img 
                                            src={getFullUrl(img.url)} 
                                            alt="Miniatura" 
                                            className="w-full h-full object-cover hover:opacity-70 cursor-pointer"
                                        />
                                    </div>
                                ))
                            ) : (
                                <span className="text-[8px] uppercase opacity-30 font-bold p-1 italic tracking-tight">Sense fotos adicionals</span>
                            )}
                        </div>

                        {/* INFO DEL VEHÍCULO */}
                        <div className="p-4 flex-grow">
                            <h3 className={`text-sm font-bold uppercase truncate ${isDarkMode ? "text-blue-100" : "text-blue-950"}`}>
                                {item.name}
                            </h3>
                            <p className="mt-1 text-[10px] line-clamp-2 opacity-60 leading-tight">
                                {item.displayDescription}
                            </p>
                        </div>

                        {/* BOTÓN EDITAR */}
                        <div className={`p-3 flex justify-end gap-2 border-t ${isDarkMode ? "border-zinc-800" : "border-gray-100"}`}>
                            <button 
                                onClick={() => setEditingItem(item)} 
                                className="text-[9px] uppercase font-bold px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-900/20"
                            >
                                Editar Vehicle
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {editingItem && (
                <EditItemModal 
                    item={editingItem} 
                    isDarkMode={isDarkMode} 
                    onClose={() => setEditingItem(null)} 
                    onUpdateSuccess={chargeData} 
                />
            )}
        </div>
    );
}

export default ExpoDetailView;