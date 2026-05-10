import { CameraIcon, XMarkIcon, MagnifyingGlassIcon, ChatBubbleBottomCenterTextIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import React, { useState, useRef, useEffect } from 'react';
import config from "../config";

export function CameraMaria({ showCamera, setShowCamera, isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stream, setStream] = useState(null);
  const [mode, setMode] = useState('description'); 
  const [exposiciones, setExposiciones] = useState([]); 
  const [selectedExpoId, setSelectedExpoId] = useState(""); 
  
  const videoRef = useRef(null);

  const getUserIdFromCookie = () => {
    const name = "uxia_user_id=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "anonim";
  };

  useEffect(() => {
    const fetchExpos = async () => {
      try {
        const response = await fetch(`${config.API_URL}/api/expo/`);
        if (response.ok) {
          const data = await response.json();
          const soloExpos = data
            .filter(item => (typeof item.id === 'string' && item.id.startsWith('expo-')) || (item.expo && !item.images?.length))
            .map(item => ({ ...item, cleanId: String(item.id).replace('expo-', '') }));
          setExposiciones(soloExpos);
        }
      } catch (error) { console.error(error); }
    };
    fetchExpos();
  }, []);

  useEffect(() => { return () => stopCamera(); }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleFileUpload = async (eventOrFile) => {
    let file = eventOrFile.target ? eventOrFile.target.files[0] : eventOrFile;
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setResultado(null);

    try {
      const tokenIA = "x4_XnsFZ3U66MZ8OOjcP2f64i6QS_t5V8qutrQDlKKw";
      const formData = new FormData();
      formData.append('image', file);

      let url = "";
      if (mode === 'id') {
        if (!selectedExpoId) {
          setResultado({ error_msg: "Si us plau, selecciona una Expo prèviament." });
          setLoading(false);
          return;
        }
        url = `${config.API_URL}/api/classify_item_api/`;
        const selectedExpo = exposiciones.find(e => e.cleanId === selectedExpoId);
        const expoNameToSend = selectedExpo?.expo || selectedExpo?.name || "SEAT-EXPO";
        formData.append('expo_name', expoNameToSend);
      } else {
        url = `${config.API_URL}/api/foto/`;
      }

      const response = await fetch(url, { 
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${tokenIA}`, 
          'Accept': 'application/json'
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details?.detail || data.error || "Error en el processament.");
      }

      setResultado(data);

      if (mode === 'description' && data.descripcio) {
        const sessionToken = localStorage.getItem("token");
        const historialData = { cookie: getUserIdFromCookie(), answers: data.descripcio };
        fetch(`${config.API_URL}/api/save_historial/`, { 
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionToken}`
          },
          body: JSON.stringify(historialData)
        }).catch(err => console.error("Error saving history:", err));
      }

    } catch (error) {
      console.error("[DEBUG] Error:", error);
      setResultado({ error_msg: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!showCamera) {
    return (
      <div className="flex justify-center my-8 px-4 font-sans antialiased animate-in fade-in duration-300">
        <div className={`p-[1px] rounded-full bg-gradient-to-r ${isDarkMode ? "from-blue-900/50 via-slate-800 to-orange-100/50" : "from-blue-100/50 via-slate-200 to-orange-100/50"} shadow-sm w-full sm:w-auto`}>
          <button
            onClick={() => setShowCamera(true)}
            className={`cursor-pointer flex items-center justify-center space-x-3 w-full sm:min-w-70 px-8 py-3.5 ${isDarkMode ? "bg-slate-950 hover:bg-blue-950/50" : "bg-white hover:bg-blue-50/50"} rounded-full font-semibold tracking-wide transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5 active:scale-95`}
          >
            <CameraIcon className={`w-6 h-6 stroke-[1.5] ${isDarkMode ? "text-sky-400" : "text-blue-400"}`} />
            <span className="text-base">
              Obrir <span className={`font-bold ${isDarkMode ? "text-slate-50" : "text-slate-950"}`}>marIA 2.0</span>
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={"w-full font-sans antialiased animate-in fade-in slide-in-from-top-2 duration-500 ease-out" + (isDarkMode ? " bg-black" : "")}>
      <div className="px-6 pb-6 min-h-[200px] flex flex-col justify-center max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-slate-50" : "text-slate-950"}`}>marIA 2.0</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">IA Vision System</p>
          </div>
          <button
            onClick={() => { stopCamera(); setShowCamera(false); setPreview(null); setResultado(null); }}
            className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer transition-all rounded-full hover:bg-slate-100 active:scale-90"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* --- SELECTOR DE MODO --- */}
        {!resultado && !loading && (
          <div className="flex justify-center space-x-2 mb-4 p-1 bg-slate-100/50 rounded-2xl">
            <button 
              onClick={() => setMode('description')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'description' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'
              }`}
            >
              <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
              <span>DESCRIPCIÓ</span>
            </button>
            <button 
              onClick={() => setMode('id')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'id' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'
              }`}
            >
              <MagnifyingGlassIcon className="w-4 h-4" />
              <span>IDENTIFICACIÓ</span>
            </button>
          </div>
        )}

        {/* --- DESPLEGABLE EXPOS --- */}
        {mode === 'id' && !resultado && !loading && (
          <div className="mb-6">
            <select
              value={selectedExpoId} 
              onChange={(e) => setSelectedExpoId(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold border outline-none transition-all ${
                isDarkMode ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-700 shadow-sm"
              }`}
            >
              <option value="" disabled>Selecciona una Expo...</option>
              {exposiciones.map((expo) => (
                <option key={expo.id} value={expo.cleanId}>
                  {expo.expo || expo.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* --- VISUALIZACIÓN DE RESULTADOS --- */}
        {resultado && (
          <div className={`mb-6 p-6 rounded-3xl animate-in zoom-in-95 duration-300 ${isDarkMode ? "bg-slate-900/50 border border-slate-800" : "bg-blue-50/50 border border-blue-100"}`}>
            <div className="flex items-center space-x-3 mb-4">
              <CheckBadgeIcon className="w-6 h-6 text-green-500" />
              <h3 className={`font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>Resultat de la IA</h3>
            </div>
            
            {preview && (
              <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-2xl mb-4 shadow-lg" />
            )}

            {resultado.error_msg ? (
              <p className="text-red-500 font-medium text-sm">{resultado.error_msg}</p>
            ) : (
              <div className="space-y-2">
                <p className={`text-lg font-bold capitalize ${isDarkMode ? "text-sky-400" : "text-blue-600"}`}>
                  {resultado.prediction?.replace('_', ' ') || resultado.name}
                </p>
                <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                  {resultado.description || "S'ha identificat correctament l'element a la imatge."}
                </p>
              </div>
            )}

            <button 
              onClick={() => { setResultado(null); setPreview(null); }}
              className="mt-6 w-full py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
            >
              Fer una altra foto
            </button>
          </div>
        )}

        {/* --- BOTÓN DE DISPARO (Oculto si hay resultado) --- */}
        {!resultado && (
          <div className="flex justify-center">
            <div className={`p-[1px] rounded-full bg-gradient-to-r ${isDarkMode ? "from-blue-900/50 via-slate-800 to-orange-100/50" : "from-blue-100/50 via-slate-200 to-orange-100/50"} w-full sm:w-auto shadow-xl`}>
              <label className={`cursor-pointer flex items-center justify-center space-x-3 w-full sm:min-w-70 px-8 py-4 ${
                isDarkMode ? "bg-slate-950 text-slate-50" : "bg-white text-slate-800"
              } rounded-full font-bold transition-transform active:scale-95`}>
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                    <span>Analitzant...</span>
                  </div>
                ) : (
                  <>
                    <CameraIcon className={`w-6 h-6 ${isDarkMode ? "text-sky-400" : "text-blue-400"}`} />
                    <span>FER FOTO</span>
                  </>
                )}
                <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" disabled={loading} />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}