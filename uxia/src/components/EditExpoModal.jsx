import { useState, useTransition } from 'react';
import config from '../config';
import { useTranslation } from 'react-i18next';

export default function EditExpoModal({ isOpen, onClose, expo, isDarkMode, onSuccess }) {
    const {t} = useTranslation();
    const STATE_OPTIONS = [
    { value: 'INIT', label: t('dashboard.landingPage.init') },
    { value: 'DISPONIBLE', label: t('dashboard.landingPage.available') },
    { value: 'ACTUALIZABLE', label: t('dashboard.landingPage.updatable') },
];

const LANGUAGE_OPTIONS = [
        { value: 'ca', label: 'Català' },
        { value: 'es', label: 'Castellano' },
        { value: 'en', label: 'English' },
        { value: 'fr', label: 'Francès' },
    ];
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: expo?.name || '',
        state: expo?.state || 'INIT',
        language: expo?.language || 'ca',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${config.API_URL}/api/expos/${expo.id}/edit/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                alert("Error al editar l'expo");
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
                    <h2 className="text-xl font-black uppercase tracking-tight">{t('dashboard.landingPage.edit.editExpo')}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer ">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-60">{t('dashboard.landingPage.edit.nameExpo')}</label>
                        <input
                            required
                            type="text"
                            className={`w-full p-3 rounded-xl border focus:ring-2 focus:outline-none ${isDarkMode ? "bg-zinc-800 border-zinc-700 focus:ring-orange-300" : "bg-gray-50 border-gray-200 focus:ring-blue-500"}`}
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-60">{t('dashboard.landingPage.edit.estat')}</label>
                        <select
                            className={`w-full p-3 rounded-xl cursor-pointer border focus:ring-2 focus:outline-none ${isDarkMode ? "bg-zinc-800 border-zinc-700 focus:ring-orange-300" : "bg-gray-50 border-gray-200 focus:ring-blue-500"}`}
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        >
                            {STATE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-1 opacity-60">Idioma de la Veu (TTS)</label>
                        <select
                            className={`w-full p-3 rounded-xl cursor-pointer border focus:ring-2 focus:outline-none ${isDarkMode ? "bg-zinc-800 border-zinc-700 focus:ring-orange-300" : "bg-gray-50 border-gray-200 focus:ring-blue-500"}`}
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        >
                            {LANGUAGE_OPTIONS.map((lang) => (
                                <option key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-xl cursor-pointer font-bold uppercase tracking-widest transition-all active:scale-95 ${loading ? "opacity-50 cursor-not-allowed" : ""} ${isDarkMode ? "bg-orange-400 text-black hover:bg-orange-300" : "bg-[#162354] text-white hover:bg-blue-900"}`}
                        >
                            {loading ? t('dashboard.expo.edit.save') : t('dashboard.expo.edit.saveChanges')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}