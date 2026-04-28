import React, { useEffect, useState, useCallback } from 'react'; // Añadido useCallback
import config from '../config';
import { EditItemModal } from './EditItemModal'; // Importación del componente

export function ExpoDetailView({ seleccionado, isDarkMode, hasConsent }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null); // Estado para controlar el modal

    // Extraemos chargeData para poder reutilizarla tras editar
    const chargeData = useCallback(async () => {
        if (!hasConsent || !seleccionado) return;
        
        setLoading(true);
        try {
            const response = await fetch(`${config.API_URL}/api/items_expo/${seleccionado}/`);
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const cleanItems = data
                    .filter(item => item.name !== "") 
                    .map(item => ({
                        ...item,
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
    }, [seleccionado, hasConsent]);

    useEffect(() => {
        chargeData();
    }, [chargeData]);

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
                    <div key={item.id} className={`flex flex-col rounded-2xl overflow-hidden shadow-lg ${isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"}`}>
                        <div className="relative h-48 w-full">
                            <img src={`${config.API_URL}${item.featured_image}`} alt={item.name} className="w-full h-full object-cover" />
                        </div>

                        <div className="p-4 flex-grow">
                            <h3 className={`text-lg font-bold uppercase truncate ${isDarkMode ? "text-blue-100" : "text-blue-950"}`}>{item.name}</h3>
                            <p className="mt-1 text-xs line-clamp-2 opacity-70">{item.description}</p>
                        </div>

                        <div className={`p-3 flex justify-end gap-2 border-t ${isDarkMode ? "border-zinc-800" : "border-gray-100"}`}>
                            <button 
                                onClick={() => setEditingItem(item)} // Abrir modal
                                className="text-[10px] uppercase font-bold px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Editar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* MODAL: Se muestra solo si editingItem tiene contenido */}
            {editingItem && (
                <EditItemModal 
                    item={editingItem} 
                    isDarkMode={isDarkMode} 
                    onClose={() => setEditingItem(null)} 
                    onUpdateSuccess={chargeData} 
                />
            )}

            {items.length === 0 && !loading && <div className="mt-20 text-center opacity-50">No s'han trobat ítems.</div>}
        </div>
    );
}

export default ExpoDetailView;