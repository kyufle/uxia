import React, { useState } from 'react';
import config from '../config';

export default function CreateItemModal({ isOpen, onClose, expoSeleccionada, isDarkMode, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        featured_image: null
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('expo', expoSeleccionada);
        if (formData.featured_image) {
            data.append('featured_image', formData.featured_image);
        }

        try {
            const response = await fetch(`${config.API_URL}/api/items/create/`, {
                method: 'POST',
                body: data,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                onSuccess(); // Refrescar lista
                onClose();   // Cerrar modal
                setFormData({ name: '', description: '', featured_image: null });
            } else {
                alert("Error al crear el ítem");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-all ${isDarkMode ? "bg-zinc-900 border border-zinc-800 text-white" : "bg-white text-gray-900"}`}>
                <div className="p-6 border-b border-gray-500/20 flex justify-between items-center">
                    <h2 className="text-xl font-black uppercase tracking-tight">Nou Item</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-60">Nom del Vehicle</label>
                        <input
                            required
                            type="text"
                            className={`w-full p-3 rounded-xl border focus:ring-2 focus:outline-none ${isDarkMode ? "bg-zinc-800 border-zinc-700 focus:ring-orange-300" : "bg-gray-50 border-gray-200 focus:ring-blue-500"}`}
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Ej: Seat León FR"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-60">Descripció</label>
                        <textarea
                            rows="3"
                            className={`w-full p-3 rounded-xl border focus:ring-2 focus:outline-none ${isDarkMode ? "bg-zinc-800 border-zinc-700 focus:ring-orange-300" : "bg-gray-50 border-gray-200 focus:ring-blue-500"}`}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Detalls del vehicle..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-60">Imatge Principal</label>
                        <input
                            type="file"
                            accept="image/*"
                            className={`w-full text-sm file:mr-4 cursor-pointer file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDarkMode ? "file:bg-orange-300/10 file:text-orange-300 hover:file:bg-orange-300/20" : "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"}`}
                            onChange={(e) => setFormData({...formData, featured_image: e.target.files[0]})}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-xl cursor-pointer font-bold uppercase tracking-widest transition-all active:scale-95 ${loading ? "opacity-50 cursor-not-allowed" : ""} ${isDarkMode ? "bg-orange-400 text-black hover:bg-orange-300" : "bg-[#162354] text-white hover:bg-blue-900"}`}
                        >
                            {loading ? "Enviant..." : "Crear Ítem"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}