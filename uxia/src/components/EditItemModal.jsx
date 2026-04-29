import React, { useState } from 'react';
import config from '../config';

export function EditItemModal({ item, isDarkMode, onClose, onUpdateSuccess }) {
    const [formData, setFormData] = useState({
        name: item.name,
        description: item.description,
        expo: item.expo // Nombre de la exposición
    });
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        // ENVIAMOS EL ID: Es la clave para que el backend no falle
        data.append('id', item.id); 
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('expo', formData.expo);
        
        if (imageFile) {
            data.append('featured_image', imageFile);
        }

        try {
            const response = await fetch(`${config.API_URL}/api/edit-item-admin/`, {
                method: 'POST',
                body: data,
                // Si usas tokens, añade el header de Authorization aquí
            });

            if (response.ok) {
                onUpdateSuccess(); // Refresca la lista de la Expo
                onClose();         // Cierra el modal
            } else {
                const errorData = await response.json();
                alert("Error: " + (errorData.error || "No s'ha pogut guardar"));
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            alert("Error de connexió");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border ${
                isDarkMode ? "bg-zinc-900 text-white border-zinc-700" : "bg-white text-gray-900 border-gray-200"
            }`}>
                <div className="p-6 border-b border-gray-500/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold uppercase tracking-tight">Editar Vehicle</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl cursor-pointer transition-colors">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">Nom del vehicle</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className={`w-full p-3 rounded-xl border ${
                                isDarkMode ? "bg-zinc-800 border-zinc-600 focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-400"
                            } outline-none transition-all`}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">Descripció técnica</label>
                        <textarea
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className={`w-full p-3 rounded-xl border ${
                                isDarkMode ? "bg-zinc-800 border-zinc-600 focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-400"
                            } outline-none transition-all`}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">Imatge principal (Featured)</label>
                        <div className={`mt-1 p-2 border-2 border-dashed rounded-xl ${isDarkMode ? "border-zinc-700" : "border-gray-200"}`}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setImageFile(e.target.files[0])}
                                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-3 rounded-xl font-bold text-xs cursor-pointer uppercase transition-all ${
                                isDarkMode ? "bg-zinc-800 hover:bg-zinc-700" : "bg-gray-100 hover:bg-gray-200"
                            }`}
                        >
                            Cancel·lar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 rounded-xl font-bold text-xs cursor-pointer uppercase bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20"
                        >
                            {isSubmitting ? "Actualitzant..." : "Guardar Canvis"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}