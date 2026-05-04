import React, { useState } from 'react';
import config from '../config';
import { useTranslation } from 'react-i18next';

export function EditItemModal({ item, isDarkMode, onClose, onUpdateSuccess }) {
    const {t} = useTranslation();
    const [formData, setFormData] = useState({
        name: item.name,
        description: item.description,
        expo: item.expo
    });

    // Imágenes YA existentes en el servidor
    const [existingImages, setExistingImages] = useState(() => {
        const images = [];
        // Añadimos la featured como primera
        if (item.featured_image) {
            images.push({ 
                id: 'featured', 
                url: item.featured_image.startsWith('http') ? item.featured_image : `${config.API_URL}${item.featured_image}`,
                isFeatured: true,
                isExisting: true
            });
        }
        // Añadimos las de galería
        item.images?.forEach(img => {
            images.push({
                id: img.id,
                url: img.url.startsWith('http') ? img.url : `${config.API_URL}${img.url}`,
                isFeatured: false,
                isExisting: true
            });
        });
        return images;
    });

    // Imágenes NUEVAS seleccionadas localmente
    const [newImages, setNewImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Handlers imágenes existentes ---
    const handleSetExistingFeatured = (id) => {
        setExistingImages(prev => prev.map(img => ({ ...img, isFeatured: img.id === id })));
        setNewImages(prev => prev.map(img => ({ ...img, isFeatured: false })));
    };

    const handleRemoveExisting = (id) => {
        setExistingImages(prev => {
            const updated = prev.filter(img => img.id !== id);
            const wasFeatured = prev.find(img => img.id === id)?.isFeatured;
            if (wasFeatured && updated.length > 0) updated[0].isFeatured = true;
            return updated;
        });
    };

    // --- Handlers imágenes nuevas ---
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        const noHayDestacada = !existingImages.some(i => i.isFeatured) && newImages.length === 0;
        const newImgs = files.map((file, index) => ({
            file,
            previewUrl: URL.createObjectURL(file),
            isFeatured: noHayDestacada && index === 0
        }));
        setNewImages(prev => [...prev, ...newImgs]);
    };

    const handleSetNewFeatured = (index) => {
        setExistingImages(prev => prev.map(img => ({ ...img, isFeatured: false })));
        setNewImages(prev => prev.map((img, i) => ({ ...img, isFeatured: i === index })));
    };

    const handleRemoveNew = (index) => {
        setNewImages(prev => {
            const updated = prev.filter((_, i) => i !== index);
            const wasFeatured = prev[index].isFeatured;
            if (wasFeatured && updated.length > 0) updated[0].isFeatured = true;
            else if (wasFeatured && existingImages.length > 0) {
                setExistingImages(ex => ex.map((img, i) => ({ ...img, isFeatured: i === 0 })));
            }
            return updated;
        });
    };

    // --- Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const data = new FormData();
        data.append('id', item.id);
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('expo', formData.expo);

        // Si la destacada es una imagen nueva
        const featuredNew = newImages.find(img => img.isFeatured);
        if (featuredNew) {
            data.append('featured_image', featuredNew.file);
        }

        // Si la destacada es una existente y NO es la que ya tenía de featured
        const featuredExisting = existingImages.find(img => img.isFeatured);
        if (featuredExisting && featuredExisting.id !== 'featured') {
            // Le indicamos al backend qué imagen de galería pasa a ser featured
            data.append('featured_image_id', featuredExisting.id);
        }

        // Imágenes nuevas no destacadas → galería
        newImages
            .filter(img => !img.isFeatured)
            .forEach(img => data.append('images', img.file));

        try {
            const response = await fetch(`${config.API_URL}/api/edit-item-admin/`, {
                method: 'POST',
                body: data,
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (response.ok) {
                onUpdateSuccess();
                onClose();
            } else {
                const errorData = await response.json();
                alert("Error: " + (errorData.error || t('dashboard.expo.edit.dontSave')));
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error de connexió");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalImages = existingImages.length + newImages.length;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] ${
                isDarkMode ? "bg-zinc-900 text-white border-zinc-700" : "bg-white text-gray-900 border-gray-200"
            }`}>
                {/* HEADER */}
                <div className="p-6 border-b border-gray-500/10 flex justify-between items-center shrink-0">
                    <h2 className="text-xl font-bold uppercase tracking-tight">{t('dashboard.expo.edit.title')}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-2xl cursor-pointer transition-colors">&times;</button>
                </div>

                {/* SCROLL */}
                <div className="overflow-y-auto flex-1">
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">

                        {/* NOM */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">{t('dashboard.expo.edit.name')}</label>
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

                        {/* DESCRIPCIÓ */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase mb-1 opacity-60">{t('dashboard.expo.edit.description')}</label>
                            <textarea
                                rows="4"
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className={`w-full p-3 rounded-xl border ${
                                    isDarkMode ? "bg-zinc-800 border-zinc-600 focus:border-blue-500" : "bg-gray-50 border-gray-200 focus:border-blue-400"
                                } outline-none transition-all`}
                            />
                        </div>

                        {/* IMATGES */}
                        <div>
                            <label className="block text-[10px] font-bold uppercase mb-2 opacity-60">
                                {t('dashboard.expo.edit.images')} ({totalImages}) — {t('dashboard.expo.edit.touch')}⭐
                            </label>

                            {/* GRID IMATGES EXISTENTS + NOVES */}
                            {totalImages > 0 && (
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    
                                    {/* Existents */}
                                    {existingImages.map((img) => (
                                        <div key={img.id} className="relative">
                                            <button
                                                type="button"
                                                onClick={() => handleSetExistingFeatured(img.id)}
                                                className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                                    img.isFeatured
                                                        ? "border-blue-500 ring-2 ring-blue-400/40"
                                                        : isDarkMode ? "border-zinc-700" : "border-gray-200"
                                                }`}
                                            >
                                                <img src={img.url} alt="" className="w-full h-full object-cover" />
                                            </button>
                                            {img.isFeatured && (
                                                <span className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">⭐</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveExisting(img.id)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-all"
                                            >×</button>
                                        </div>
                                    ))}

                                    {/* Noves */}
                                    {newImages.map((img, index) => (
                                        <div key={index} className="relative">
                                            <button
                                                type="button"
                                                onClick={() => handleSetNewFeatured(index)}
                                                className={`w-full aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                                    img.isFeatured
                                                        ? "border-blue-500 ring-2 ring-blue-400/40"
                                                        : isDarkMode ? "border-zinc-700 border-dashed" : "border-gray-300 border-dashed"
                                                }`}
                                            >
                                                <img src={img.previewUrl} alt="" className="w-full h-full object-cover" />
                                            </button>
                                            {/* Badge "nova" */}
                                            <span className="absolute bottom-1 left-1 bg-green-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full">NEW</span>
                                            {img.isFeatured && (
                                                <span className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">⭐</span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveNew(index)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-all"
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* INPUT AFEGIR MÉS */}
                            <div className={`p-3 border-2 border-dashed rounded-xl ${isDarkMode ? "border-zinc-700" : "border-gray-200"}`}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">{t('dashboard.expo.edit.addImages')}</p>
                            </div>
                        </div>

                        {/* BOTONS */}
                        <div className="pt-2 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className={`flex-1 py-3 rounded-xl font-bold text-xs cursor-pointer uppercase transition-all ${
                                    isDarkMode ? "bg-zinc-800 hover:bg-zinc-700" : "bg-gray-100 hover:bg-gray-200"
                                }`}
                            >
                                {t('dashboard.expo.edit.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 py-3 rounded-xl font-bold text-xs cursor-pointer uppercase bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-900/20"
                            >
                                {isSubmitting ? t('dashboard.expo.edit.updating') : t('dashboard.expo.edit.saveChanges')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}