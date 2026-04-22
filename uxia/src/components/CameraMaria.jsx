import { CameraIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

export function CameraMaria({ showCamera, setShowCamera }) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setResultado(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://uxiaweb2.ieti.site:8000/api/foto/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error en la resposta del servidor');

      const data = await response.json();
      setResultado(data);
    } catch (error) {
      console.error("Error marIA:", error);
      alert("No s'ha pogut connectar amb l'IA.");
    } finally {
      setLoading(false);
    }
  };

 if (!showCamera) {
  return (
    <div className="flex justify-center my-8 px-4 font-sans antialiased">
      <div className="p-[1px] rounded-full bg-gradient-to-r from-blue-100/50 via-slate-200 to-orange-100/50 shadow-sm w-full sm:w-auto">
        <button 
          onClick={() => setShowCamera(true)}
          className="
            cursor-pointer 
            flex items-center justify-center 
            space-x-3 
            w-full sm:w-auto 
            px-8 py-3.5 
            bg-slate-50 
            text-slate-800 
            rounded-full 
            font-semibold 
            tracking-wide
            transition-all duration-300 ease-out
            hover:bg-blue-50/50 
            hover:shadow-md 
            hover:-translate-y-0.5
            active:scale-95 active:translate-y-0
          "
        >
          <CameraIcon className="w-6 h-6 text-blue-400 stroke-[1.5]" />
          <span className="text-base">
            Obrir <span className="font-bold text-slate-950">marIA 2.0</span>
          </span>
          <span className="relative flex h-2 w-2 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-400/80"></span>
          </span>
        </button>
      </div>
    </div>
  );
}

  return (
    /* Reducimos el margen y padding en móvil (my-4 p-5) y lo subimos en desktop (sm:my-10 sm:p-8) */
    <section className="max-w-xl mx-4 sm:mx-auto my-4 sm:my-10 p-5 sm:p-8 bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300">
      
      <div className="flex justify-between items-start mb-6 sm:mb-8">
        <div className="text-left">
          {/* Título más pequeño en móvil para evitar saltos de línea raros */}
          <h2 className="text-2xl sm:text-3xl font-black text-gray-800 tracking-tight">marIA 2.0</h2>
          <p className="text-gray-500 text-xs sm:text-sm font-medium">IA Vision System</p>
        </div>
        <button 
          onClick={() => { setShowCamera(false); setPreview(null); setResultado(null); }}
          className="text-gray-400 cursor-pointer hover:text-red-500 transition-colors text-sm sm:text-base p-1"
        >
          ✕ <span className="hidden sm:inline">Tancar</span>
        </button>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col items-center justify-center">
          <label className={`
            group relative flex items-center justify-center w-full py-4 sm:py-5 
            rounded-2xl font-bold text-white transition-all duration-300 transform
            ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-xl cursor-pointer'}
          `}>
            {loading ? (
               <div className="flex items-center space-x-3">
               <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
               <span className="text-sm sm:text-base">Analitzant...</span>
             </div>
            ) : (
              <div className="flex items-center space-x-3 text-white">
                <span className="text-lg sm:text-xl">📷</span>
                <span className="text-sm sm:text-base">{preview ? "Canviar foto" : "Fer o pujar foto"}</span>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} disabled={loading} className="hidden" />
          </label>
        </div>
        {resultado && (
          <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-indigo-50 rounded-2xl border border-indigo-100 italic font-medium text-sm sm:text-base text-indigo-900">
            "{resultado.descripcio}"
          </div>
        )}
      </div>
    </section>
  );
}