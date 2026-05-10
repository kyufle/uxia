import { CameraIcon, XMarkIcon, MagnifyingGlassIcon, ChatBubbleBottomCenterTextIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import React, { useState, useRef, useEffect } from 'react';
import config from "../config";
import VoiceButton from './VoiceButton';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const openCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(s);
    } catch (err) { console.error("Error accessing camera:", err); }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
      handleFileUpload(file);
      stopCamera();
    }, 'image/jpeg');
  };

  const handleFileUpload = async (eventOrFile) => {
    let file = eventOrFile.target ? eventOrFile.target.files[0] : eventOrFile;
    if (!file) return;

    const selectedLanguage = localStorage.getItem('i18nextLng') || 'ca';
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setResultado(null);

    try {
      const tokenIA = "x4_XnsFZ3U66MZ8OOjcP2f64i6QS_t5V8qutrQDlKKw";
      const formData = new FormData();
      formData.append('image', file);
      formData.append('lang', selectedLanguage);

      let url = "";
      let isClassify;
      if (mode === 'id') {
        if (!selectedExpoId) {
          setResultado({ error_msg: t('landingPage.maria.dontSelectExpoError') });
          setLoading(false);
          return;
        }
        url = `${config.API_URL}/api/classify_item_api/`;
        isClassify = true;
        const selectedExpo = exposiciones.find(e => e.cleanId === selectedExpoId);
        const expoNameToSend = selectedExpo?.expo || selectedExpo?.name || "SEAT-EXPO";
        formData.append('expo_name', expoNameToSend);
      } else {
        url = `${config.API_URL}/api/foto/`;
        isClassify = false;
      }

      const response = await fetch(url, { 
        method: 'POST', 
        headers: {
          'Authorization': isClassify ? `Bearer ${tokenIA}` : undefined,
          'Accept': 'application/json'
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details?.detail || data.error || t('landingPage.maria.errorProcess'));
      }

      setResultado(data);

      if (mode === 'description' && data.descripcio) {
        const sessionToken = localStorage.getItem("token");
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
          const base64data = reader.result;
          const historialData = { cookie: getUserIdFromCookie(), answers: data.descripcio, car_photo: base64data };
          fetch(`${config.API_URL}/api/save_historial/`, { 
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(historialData)
        }).catch(err => console.error("Error saving history:", err));
        }
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
              {t('landingPage.maria.button')} <span className={`font-bold ${isDarkMode ? "text-slate-50" : "text-slate-950"}`}>marIA 2.0</span>
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

        {/* MODO Y EXPOS */}
        {!resultado && !loading && (
          <>
            <div className="flex justify-center space-x-2 mb-4 p-1 bg-slate-100/50 rounded-2xl">
              <button 
                onClick={() => setMode('description')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'description' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'
                }`}
              >
                <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                <span>{t('landingPage.maria.modeDescription')}</span>
              </button>
              <button 
                onClick={() => setMode('id')}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'id' ? 'bg-white shadow-sm text-orange-600' : 'text-slate-400'
                }`}
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span>{t('landingPage.maria.modeId')}</span>
              </button>
            </div>

            {mode === 'id' && (
              <div className="mb-6 animate-in fade-in duration-300">
                <select
                  value={selectedExpoId} 
                  onChange={(e) => setSelectedExpoId(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold border outline-none transition-all ${
                    isDarkMode ? "bg-slate-900 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-700 shadow-sm"
                  }`}
                >
                  <option value="" disabled>{t('landingPage.maria.selectExpo')}</option>
                  {exposiciones.map((expo) => (
                    <option key={expo.id} value={expo.cleanId}>
                      {expo.expo || expo.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        {/* INTERFAZ DE CAPTURA */}
        {!resultado && (
          <div className="flex flex-col items-center justify-center space-y-4">
            {loading ? (
              <div className="flex flex-col items-center space-y-3 p-8">
                <div className="w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
                <p className={isDarkMode ? "text-white" : "text-black"}>{t('landingPage.maria.analyzing')}</p>
              </div>
            ) : isMobile ? (
              <div className={`p-[1px] rounded-full bg-gradient-to-r ${isDarkMode ? "from-blue-900/50 via-slate-800 to-orange-100/50" : "from-blue-100/50 via-slate-200 to-orange-100/50"} shadow-sm w-full sm:w-auto`}>
                <label className={`cursor-pointer flex items-center justify-center space-x-3 w-full sm:min-w-70 px-8 py-3.5 ${isDarkMode ? "bg-slate-950 text-slate-50" : "bg-white text-slate-800"} rounded-full font-semibold tracking-wide transition-all duration-300 active:scale-95`}>
                  <CameraIcon className="w-6 h-6" />
                  <span className="text-base">{t('landingPage.maria.photo')}</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            ) : (
              !stream ? (
                <div className={`p-[1px] rounded-full bg-gradient-to-r ${isDarkMode ? "from-blue-900/50 via-slate-800 to-orange-100/50" : "from-blue-100/50 via-slate-200 to-orange-100/50"} shadow-sm w-full sm:w-auto`}>
                  <button onClick={openCamera} className={`flex items-center justify-center space-x-3 w-full sm:min-w-70 px-8 py-3.5 ${isDarkMode ? "bg-slate-950 text-slate-50" : "bg-white text-slate-800"} rounded-full font-semibold transition-all active:scale-95`}>
                    <CameraIcon className="w-6 h-6" />
                    <span className="text-base">{t('landingPage.maria.buttonMaria')}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <video ref={videoRef} autoPlay playsInline className="rounded-xl w-full max-w-xs shadow-lg border-2 border-blue-500" />
                  <button onClick={takePhoto} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all shadow-md active:scale-95">
                    {t('landingPage.maria.photo')}
                  </button>
                </div>
              )
            )}
          </div>
        )}

        {/* RESULTADOS */}
        {resultado && (
          <div className={`mt-4 p-6 rounded-3xl animate-in zoom-in-95 duration-300 shadow-xl border ${isDarkMode ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-blue-50 text-black"}`}>
            <div className="flex items-center space-x-3 mb-4">
              <CheckBadgeIcon className="w-6 h-6 text-green-500" />
              <h3 className="font-bold uppercase tracking-tight">{t('landingPage.maria.resultTitle')}</h3>
            </div>

            {preview && (
              <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-2xl mb-4 shadow-inner" />
            )}

            {resultado.error_msg ? (
              <p className="text-red-500 font-medium text-sm">{resultado.error_msg}</p>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className={`text-lg font-bold capitalize ${isDarkMode ? "text-sky-400" : "text-blue-600"}`}>
                    {resultado.prediction?.replace(/_/g, ' ') || resultado.name || t('landingPage.maria.elementDetected')}
                  </p>
                  <p className="text-sm leading-relaxed opacity-80 italic">
                    "{resultado.descripcio || resultado.description || t('landingPage.maria.noDescription')}"
                  </p>
                </div>

                {/* BOTÓN DE VOZ INTEGRADO */}
                <VoiceButton 
                  text={resultado.descripcio || resultado.description}
                  language={resultado.idioma || localStorage.getItem('i18nextLng') || 'ca'}
                  isDarkMode={isDarkMode} 
                />

                <button 
                  onClick={() => { setResultado(null); setPreview(null); }}
                  className="w-full py-2 mt-4 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-500 transition-colors border-t border-slate-100/10 pt-4"
                >
                  {t('landingPage.maria.retry') || 'Fer una altra foto'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}