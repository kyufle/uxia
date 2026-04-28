import React, { useState } from 'react';
import config from '../config';

export function EditItemModal({ item, isDarkMode, onClose, onUpdateSuccess }) {
    const [formData, setFormData] = useState({
        name: item.name,
        description: item.description,
        expo: item.expo // Mantenemos la expo actual
    });
    const [imageFile, setImageFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('current_name', item.name); // Para que el backend lo encuentre
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('expo', formData.expo);
        if (imageFile) {
            data.append('featured_image', imageFile);
        }

        try {
            const response = await fetch(`${config.API_URL}/api/edit-item-admin/`, {
                method: 'POST',
                // Importante: No poner Content-Type manual al usar FormData, el navegador lo hará solo
                body: data,
                headers: {
                    // 'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Si usas JWT
                }
            });

            if (response.ok) {
                onUpdateSuccess();
                onClose();
            } else {
                alert("Error al actualizar el ítem");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${isDarkMode ? "bg-zinc-900 text-white border border-zinc-700" : "bg-white text-gray-900"}`}>
                <div className="p-6 border-b border-gray-500/20 flex justify-between items-center">
                    <h2 className="text-xl font-bold uppercase tracking-tight">Editar Ítem</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 text-2xl">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-70">Nom de l'ítem</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className={`w-full p-3 rounded-lg border ${isDarkMode ? "bg-zinc-800 border-zinc-600" : "bg-gray-50 border-gray-200"}`}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-70">Descripció</label>
                        <textarea
                            rows="3"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className={`w-full p-3 rounded-lg border ${isDarkMode ? "bg-zinc-800 border-zinc-600" : "bg-gray-50 border-gray-200"}`}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-70">Nova Imatge Destacada (Opcional)</label>
                        <input
                            type="file"
                            onChange={(e) => setImageFile(e.target.files[0])}
                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase ${isDarkMode ? "bg-zinc-800" : "bg-gray-100"}`}
                        >
                            Cancel·lar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 rounded-xl font-bold text-xs uppercase bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Guardant..." : "Guardar Canvis"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}