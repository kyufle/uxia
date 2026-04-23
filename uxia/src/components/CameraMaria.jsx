import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
      const response = await fetch('https://uxiaweb2.ieti.site/api/foto/', {
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
      <div className="flex justify-center my-8 px-4 font-sans antialiased animate-in fade-in duration-300">
        <div className="p-[1px] rounded-full bg-gradient-to-r from-blue-100/50 via-slate-200 to-orange-100/50 shadow-sm w-full sm:w-auto">
          <button
            onClick={() => setShowCamera(true)}
            className="cursor-pointer flex items-center justify-center space-x-3 w-full sm:min-w-[280px] px-8 py-3.5 bg-slate-50 text-slate-800 rounded-full font-semibold tracking-wide transition-all duration-300 ease-out hover:bg-blue-50/50 hover:shadow-md hover:-translate-y-0.5 active:scale-95"
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
    <div className="w-full font-sans antialiased animate-in fade-in slide-in-from-top-2 duration-500 ease-out">
      <div className="relative flex items-center py-4 px-2">
        <div className="flex-grow border-t border-slate-100 shadow-[0_-1px_2px_rgba(0,0,0,0.03)]"></div>
      </div>
      <div className="px-6 pb-6 min-h-[200px] flex flex-col justify-center">
        <div className="flex justify-between items-center mb-6">
          <div className="text-left">
            <h2 className="text-xl font-bold text-slate-950 tracking-tight">marIA 2.0</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">IA Vision System</p>
          </div>

          <button
            onClick={() => { setShowCamera(false); setPreview(null); setResultado(null); }}
            className="p-1.5 text-slate-400 hover:text-slate-600 transition-all rounded-full hover:bg-slate-100 active:scale-90"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center">
            <label className={`
              group relative flex items-center justify-center w-full sm:max-w-[300px] h-[58px]
              rounded-full font-semibold transition-all duration-300 ease-in-out border border-slate-200/60
              ${loading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-inner'
                : 'bg-white text-slate-800 hover:bg-blue-50/40 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer'}
            `}>
              {loading ? (
                <div className="flex items-center space-x-3">
                  <svg className="animate-spin h-5 w-5 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-sm font-bold text-slate-500">Analitzant...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <CameraIcon className="w-5 h-5 text-blue-400 stroke-[2]" />
                  <span className="text-sm">{preview ? "Canviar foto" : "Fer o pujar foto"}</span>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} disabled={loading} className="hidden" />
            </label>
          </div>

          {resultado && (
            <div className="mt-4 p-4 bg-gradient-to-br from-blue-50/30 to-white rounded-2xl border border-blue-100/40 shadow-sm animate-in zoom-in-95 slide-in-from-top-2 duration-300">
              <p className="text-slate-600 text-center text-sm italic font-medium leading-relaxed">
                "{resultado.descripcio}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
