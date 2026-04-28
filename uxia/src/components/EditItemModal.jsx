import React, { useState } from 'react';
import config from '../config';

export function EditItemModal({ item, isDarkMode, onClose, onUpdateSuccess }) {
    const [formData, setFormData] = useState({
        name: item.name,
        description: item.description,
    });
    
    // Estados para archivos
    const [featuredFile, setFeaturedFile] = useState(null); // Imagen destacada (Item)
    const [galleryFiles, setGalleryFiles] = useState([]);   // Galería (modelo Image)
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('id', item.id); 
        data.append('name', formData.name);
        data.append('description', formData.description);
        
        // 1. Añadir imagen destacada (si se ha seleccionado una nueva)
        if (featuredFile) {
            data.append('featured_image', featuredFile);
        }

        // 2. Añadir múltiples imágenes para la galería
        if (galleryFiles.length > 0) {
            galleryFiles.forEach((file) => {
                data.append('images', file); 
            });
        }

        try {
            const response = await fetch(`${config.API_URL}/api/edit-item-admin/`, {
                method: 'POST',
                body: data,
            });

            if (response.ok) {
                onUpdateSuccess(); 
                onClose();         
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
            <div className={`w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border ${
                isDarkMode ? "bg-zinc-900 text-white border-zinc-700" : "bg-white text-gray-900 border-gray-200"
            }`}>
                <div className="p-6 border-b border-gray-500/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold uppercase tracking-tight">Editar Item i Galeria</h2>
                    <button onClick={onClose} className="cursor-pointer text-gray-400 hover:text-red-500 text-2xl transition-colors">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">Nom</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className={`w-full p-3 rounded-xl border ${
                                    isDarkMode ? "bg-zinc-800 border-zinc-600 focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-400"
                                } outline-none transition-all text-sm`}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">Descripció</label>
                            <textarea
                                rows="3"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className={`w-full p-3 rounded-xl border ${
                                    isDarkMode ? "bg-zinc-800 border-zinc-600 focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-400"
                                } outline-none transition-all text-sm`}
                            />
                        </div>
                    </div>

                    {/* Selector Imagen Destacada */}
                    <div className={`p-3 rounded-2xl border ${isDarkMode ? "bg-zinc-950/50 border-zinc-800" : "bg-gray-50 border-gray-100"}`}>
                        <label className="block text-[10px] font-bold uppercase mb-2 text-blue-500">Imatge Destacada (Principal)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFeaturedFile(e.target.files[0])}
                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                        />
                    </div>

                    {/* Selector Galería Múltiple CORREGIDO */}
                    <div className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
                        galleryFiles.length > 0 
                        ? "border-emerald-500 bg-emerald-500/5" 
                        : (isDarkMode ? "border-zinc-700 bg-zinc-950/30" : "border-gray-200 bg-gray-50")
                    }`}>
                        <label className="block text-[10px] font-bold uppercase mb-2 text-emerald-500 tracking-wider">
                            📸 Galeria (Selecció Múltiple)
                        </label>
                        
                        <input
                            type="file"
                            multiple={true} // Asegura la selección múltiple
                            accept="image/*"
                            onChange={(e) => {
                                const files = Array.from(e.target.files);
                                setGalleryFiles(files);
                            }}
                            // Importante: permite volver a seleccionar si te equivocas
                            onClick={(e) => (e.target.value = null)} 
                            className="block w-full text-xs text-gray-500 
                            file:mr-4 file:py-2 file:px-4 
                            file:rounded-full file:border-0 
                            file:text-[10px] file:font-bold 
                            file:bg-emerald-600 file:text-white 
                            hover:file:bg-emerald-700 cursor-pointer"
                        />

                        {galleryFiles.length > 0 && (
                            <div className="mt-3">
                                <p className="text-[10px] font-bold text-emerald-500 uppercase flex items-center gap-1">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                    {galleryFiles.length} imatges seleccionades
                                </p>
                                <ul className="mt-1 text-[9px] opacity-60">
                                    {galleryFiles.slice(0, 2).map((f, i) => (
                                        <li key={i} className="truncate">• {f.name}</li>
                                    ))}
                                    {galleryFiles.length > 2 && <li>... i {galleryFiles.length - 2} més</li>}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`cursor-pointer flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all ${
                                isDarkMode ? "bg-zinc-800 hover:bg-zinc-700" : "bg-gray-100 hover:bg-gray-200"
                            }`}
                        >
                            Cancel·lar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="cursor-pointer flex-1 py-3 rounded-xl font-bold text-xs uppercase bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20"
                        >
                            {isSubmitting ? "Guardant..." : "Guardar Canvis"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}