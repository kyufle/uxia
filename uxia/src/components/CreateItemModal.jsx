import React, { useState } from 'react';
import config from '../config';
import { useTranslation } from 'react-i18next';

export default function CreateItemModal({ isOpen, onClose, expoSeleccionada, isDarkMode, onSuccess }) {
    const {t} = useTranslation();
    const [loading, setLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file, index) => ({
            file,
            previewUrl: URL.createObjectURL(file),
            isFeatured: index === 0 && selectedImages.length === 0
        }));
        setSelectedImages(prev => [...prev, ...newImages]);
    };

    const handleSetFeatured = (index) => {
        setSelectedImages(prev =>
            prev.map((img, i) => ({ ...img, isFeatured: i === index }))
        );
    };

    const handleRemoveImage = (index) => {
        setSelectedImages(prev => {
            const updated = prev.filter((_, i) => i !== index);
            if (prev[index].isFeatured && updated.length > 0) {
                updated[0].isFeatured = true;
            }
            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('expo', expoSeleccionada);

        const featured = selectedImages.find(img => img.isFeatured);
        if (featured) {
            data.append('featured_image', featured.file);
        }

        selectedImages
            .filter(img => !img.isFeatured)
            .forEach(img => data.append('images', img.file));

        try {
            const response = await fetch(`${config.API_URL}/api/items/create/`, {
                method: 'POST',
                body: data,
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                onSuccess();
                onClose();
                setFormData({ name: '', description: '' });
                setSelectedImages([]);
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
            <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all ${isDarkMode ? "bg-zinc-900 border border-zinc-800 text-white" : "bg-white text-gray-900"}`}>
                
                {/* HEADER */}
                <div className="p-6 border-b border-gray-500/20 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-black uppercase tracking-tight">{t('dashboard.expo.newItem')}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* SCROLL AREA */}
                <div className="overflow-y-auto flex-1">
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        
                        {/* NOM */}
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1 opacity-60">{t('dashboard.expo.edit.name')}</label>
                            <input
                                required
                                type="text"
                                className={`w-full p-3 rounded-xl border focus:ring-2 focus:outline-none ${isDarkMode ? "bg-zinc-800 border-zinc-700 focus:ring-orange-300" : "bg-gray-50 border-gray-200 focus:ring-blue-500"}`}
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Ej: Seat León FR"
                            />
                        </div>

                        {/* DESCRIPCIÓ */}
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1 opacity-60">{t('dashboard.expo.edit.description')}</label>
                            <textarea
                                rows="3"
                                className={`w-full p-3 rounded-xl border focus:ring-2 focus:outline-none ${isDarkMode ? "bg-zinc-800 border-zinc-700 focus:ring-orange-300" : "bg-gray-50 border-gray-200 focus:ring-blue-500"}`}
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                placeholder={t('dashboard.expo.edit.vehicleDetalls')}
                            />
                        </div>

                        {/* SELECTOR IMATGES */}
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1 opacity-60">
                                {t('dashboard.expo.edit.images')} ({selectedImages.length} {t('dashboard.expo.edit.select')})
                            </label>
                            <div className={`p-3 border-2 border-dashed rounded-xl ${isDarkMode ? "border-zinc-700" : "border-gray-200"}`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className={`w-full text-sm file:mr-4 cursor-pointer file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${isDarkMode ? "file:bg-orange-300/10 file:text-orange-300 hover:file:bg-orange-300/20" : "file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"}`}
                                />
                                <p className="text-[10px] text-gray-400 mt-2">
                                    {t('dashboard.expo.edit.text')}
                                </p>
                            </div>
                        </div>

                        {/* PREVIEW IMATGES */}
                        {selectedImages.length > 0 && (
                            <div>
                                <label className="block text-[10px] font-bold uppercase mb-2 opacity-60">
                                    {t('dashboard.expo.edit.touch')} ⭐
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {selectedImages.map((img, index) => (
                                        <div key={index} className="relative">
                                            <button
                                                type="button"
                                                onClick={() => handleSetFeatured(index)}
                                                className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                                    img.isFeatured
                                                        ? "border-blue-500 ring-2 ring-blue-400/40"
                                                        : isDarkMode ? "border-zinc-700" : "border-gray-200"
                                                }`}
                                            >
                                                <img
                                                    src={img.previewUrl}
                                                    alt={`preview ${index}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>

                                            {img.isFeatured && (
                                                <span className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                                    ⭐
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center leading-none hover:bg-red-600 transition-all"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* BOTÓ SUBMIT */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-3 rounded-xl cursor-pointer font-bold uppercase tracking-widest transition-all active:scale-95 ${loading ? "opacity-50 cursor-not-allowed" : ""} ${isDarkMode ? "bg-orange-400 text-black hover:bg-orange-300" : "bg-[#162354] text-white hover:bg-blue-900"}`}
                            >
                                {loading ? t('dashboard.expo.edit.send') : t('dashboard.expo.edit.createItem')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}