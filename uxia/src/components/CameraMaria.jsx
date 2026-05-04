import { CameraIcon, XMarkIcon, MagnifyingGlassIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';
import React, { useState, useRef, useEffect } from 'react';
import config from "../config";

const isMobile = /Mobi|Android/i.test(navigator.userAgent);

export function CameraMaria({ showCamera, setShowCamera, isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [preview, setPreview] = useState(null);
  const [stream, setStream] = useState(null);
  const [mode, setMode] = useState('description'); 
  const [exposiciones, setExposiciones] = useState([]); 
  const [selectedExpoId, setSelectedExpoId] = useState(""); 
  
  const videoRef = useRef(null);

  const getAuthToken = async () => {
    let token = localStorage.getItem('token');
    if (token) return token;
    try {
      const authRes = await fetch(`${config.API_URL}/api/auth/login/`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: "uxiaweb2",
          password: "uxiaweb314",
          device: "web_browser"
        })
      });
      if (authRes.ok) {
        const authData = await authRes.json();
        const tokenRecibido = authData.token || authData.access;
        localStorage.setItem('token', tokenRecibido);
        return tokenRecibido;
      }
    } catch (err) { console.error(err); }
    return null;
  };

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
  useEffect(() => { if (videoRef.current && stream) videoRef.current.srcObject = stream; }, [stream]);

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(mediaStream);
    } catch (err) { console.error(err); }
  };

  const takePhoto = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      handleFileUpload(file);
      stopCamera();
    }, "image/jpeg");
  };

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

    const token = await getAuthToken();
    if (!token) {
      setResultado({ error_msg: "Error d'autenticació al sistema." });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      let url = "";
      if (mode === 'id') {
        if (!selectedExpoId) {
          setResultado({ error_msg: "Si us plau, selecciona una Expo prèviament." });
          setLoading(false);
          return;
        }
        url = `${config.API_URL}/api/classify/`; 
        formData.append('expo_id', String(selectedExpoId).replace('expo-', ''));
      } else {
        url = `${config.API_URL}/api/foto/`;
      }

      const response = await fetch(url, { 
        method: 'POST', 
        body: formData,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      console.log("Resposta del servidor:", data);

      if (!response.ok) {
        // Manejo de errores como mensajes normales (503, 401, etc)
        const msg = (data.details.detail || "S'ha produït un error en processar la imatge.");
        setResultado({ error_msg: msg });
        setLoading(false);
        return;
      }

      setResultado(data);

      if (mode === 'description' && data.descripcio) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          const historialData = { cookie: getUserIdFromCookie(), answers: data.descripcio, car_photo: reader.result };
          await fetch(`${config.API_URL}/api/save_historial/`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(historialData),
          });
        };
      }
    } catch (error) {
      setResultado({ error_msg: "No s'ha pogut connectar amb el servidor." });
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
      <div className="relative flex items-center py-4 px-2">
        <div className={`flex-grow border-t ${isDarkMode ? "border-slate-900 shadow-[0_-1px_2_rgba(255,255,255,0.03)]" : "border-slate-100 shadow-[0_-1px_2_rgba(0,0,0,0.03)]"}`}></div>
      </div>
      
      <div className="px-6 pb-6 min-h-[200px] flex flex-col justify-center">
        <div className="flex justify-between items-center mb-6">
          <div className="text-left">
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-slate-50" : "text-slate-950"} tracking-tight`}>marIA 2.0</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">IA Vision System</p>
          </div>
          <button
            onClick={() => { stopCamera(); setShowCamera(false); setPreview(null); setResultado(null); }}
            className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer transition-all rounded-full hover:bg-slate-100 active:scale-90"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {!resultado && !loading && (
          <>
            <div className="flex justify-center space-x-2 mb-4 p-1 bg-slate-100/50 rounded-2xl">
              <button 
                onClick={() => setMode('description')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'description' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
              >
                <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                <span>ITEM DESCRIPTION</span>
              </button>
              <button 
                onClick={() => setMode('id')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${mode === 'id' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'}`}
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span>ITEM ID</span>
              </button>
            </div>

            {mode === 'id' && (
              <div className="mb-6 animate-in fade-in slide-in-from-top-1 duration-300">
                <select
                  value={selectedExpoId} 
                  onChange={(e) => setSelectedExpoId(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold border outline-none transition-all ${
                    isDarkMode ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-700 shadow-sm"
                  }`}
                >
                  <option value="" disabled>Selecciona una Expo...</option>
                  {exposiciones.map((expo) => (
                    <option key={expo.id} value={expo.cleanId}>{expo.expo || expo.name || `Expo ${expo.cleanId}`}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-3">
            {loading ? (
              <p className={isDarkMode ? "text-white text-sm" : "text-black text-sm"}>Analitzant...</p>
            ) : isMobile ? (
              <div className={`p-[1px] rounded-full bg-gradient-to-r ${isDarkMode ? "from-blue-900/50 via-slate-800 to-orange-100/50" : (mode === 'id' ? "from-orange-400 via-orange-200 to-blue-400" : "from-blue-100/50 via-slate-200 to-orange-100/50")} shadow-sm w-full sm:w-auto`}>
                <label className={`cursor-pointer flex items-center justify-center space-x-3 w-full sm:min-w-70 px-8 py-3.5 ${isDarkMode ? "bg-slate-950 text-slate-50 hover:bg-blue-950/50" : "bg-white text-slate-800 hover:bg-blue-50/50"} rounded-full font-semibold tracking-wide transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5 active:scale-95`}>
                  <CameraIcon className={`w-6 h-6 stroke-[1.5] ${isDarkMode ? "text-sky-400" : (mode === 'id' ? "text-orange-500" : "text-blue-400")}`} />
                  <span className="text-base">{preview ? "Canviar foto" : (mode === 'id' ? "Identificar Item" : "Descriure Item")}</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            ) : (
               !stream ? (
                <div className={`p-[1px] rounded-full bg-gradient-to-r ${isDarkMode ? "from-blue-900/50 via-slate-800 to-orange-100/50" : "from-blue-100/50 via-slate-200 to-orange-100/50"} shadow-sm w-full sm:w-auto`}>
                  <button onClick={openCamera} className={`cursor-pointer flex items-center justify-center space-x-3 w-full sm:min-w-70 px-8 py-3.5 ${isDarkMode ? "bg-slate-950 text-slate-50 hover:bg-blue-950/50" : "bg-white text-slate-800 hover:bg-blue-50/50"} rounded-full font-semibold tracking-wide transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5 active:scale-95`}>
                    <CameraIcon className={`w-6 h-6 stroke-[1.5] ${isDarkMode ? "text-sky-400" : "text-blue-400"}`} />
                    <span className="text-base">Obrir càmera</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <video ref={videoRef} autoPlay playsInline className="rounded-xl w-full max-w-xs" />
                  <button onClick={takePhoto} className="px-4 py-2 bg-green-500 cursor-pointer hover:scale-90 transition-all text-white rounded-full">Fer foto</button>
                </div>
              )
            )}
          </div>

          {resultado && (
            <div className={`mt-4 p-4 rounded-2xl border shadow-sm animate-in zoom-in-95 slide-in-from-top-2 duration-300 ${isDarkMode ? "bg-slate-900/40 border-slate-800" : "bg-white border-blue-100/40"}`}>
              {resultado.error_msg ? (
                <div className="text-center py-2">
                  <p className="text-orange-500 font-medium text-sm italic">"{resultado.error_msg}"</p>
                </div>
              ) : mode === 'id' ? (
                resultado.match ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-green-600 font-bold text-[10px] uppercase">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span>Coincidència Troba</span>
                    </div>
                    {resultado.item.image && (
                      <img src={`${config.API_URL}${resultado.item.image}`} alt="Item" className="w-full h-40 object-cover rounded-xl shadow-sm" />
                    )}
                    <h3 className={`text-lg font-black italic uppercase ${isDarkMode ? "text-slate-50" : "text-slate-950"}`}>{resultado.item.name}</h3>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>{resultado.item.description}</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-orange-500 font-bold text-sm mb-1">No s'ha trobat a la BD</p>
                    <p className="text-slate-400 text-[10px] uppercase tracking-wider italic">Predicció IA: "{resultado.prediction}"</p>
                  </div>
                )
              ) : (
                <p className={"text-center text-sm italic font-medium leading-relaxed " + (isDarkMode ? "text-white " : "text-black")}>
                  "{resultado.descripcio}"
                </p>
              )}
              
              <button 
                onClick={() => { setResultado(null); setPreview(null); }}
                className="w-full cursor-pointer mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-500 transition-colors"
              >
                Nova consulta
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}