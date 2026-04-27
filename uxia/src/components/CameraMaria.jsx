import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';


//para saber si es movil o no, para mostrar un boton de input file en vez de la camara
const isMobile = /Mobi|Android/i.test(navigator.userAgent);

export function CameraMaria({ showCamera, setShowCamera, isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [preview, setPreview] = useState(null);
  //he añadido un estado para controlar si el stream de la camara esta activo o no, y un ref para el video
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const openCamera = async () => {
  try {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });

    setStream(mediaStream);
  } catch (err) {
    console.error("Error accediendo a la cámara:", err);
  }
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
    stopCamera(); // 👈 IMPORTANTE
  }, "image/jpeg");
  };

  const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    setStream(null);
  }
};
  
  const handleFileUpload = async (eventOrFile) => {
  let file;

  // Si viene del input (evento)
  if (eventOrFile.target) {
    file = eventOrFile.target.files[0];
  } else {
    // Si viene de la cámara (File directo)
    file = eventOrFile;
  }

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
        <div className={`p-[1px] rounded-full bg-gradient-to-r ${isDarkMode ? "from-blue-900/50 via-slate-800 to-orange-100/50" : "from-blue-100/50 via-slate-200 to-orange-100/50"} shadow-sm w-full sm:w-auto`}>
          <button
            onClick={() => setShowCamera(true)}
            className={`cursor-pointer flex items-center justify-center space-x-3 w-full sm:min-w-70 px-8 py-3.5 ${isDarkMode ? "bg-slate-950 hover:bg-blue-950/50" : "bg-slate-50ff hover:bg-blue-50/50"} + " rounded-full font-semibold tracking-wide transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5 active:scale-95`}
          >
            <CameraIcon
              className={`w-6 h-6 stroke-[1.5] ${
                isDarkMode ? "text-sky-400" : "text-blue-400"
              }`}
            />
            <span className="text-base">
              Obrir <span className={`font-bold ${isDarkMode ? "text-slate-50" : "text-slate-950"}`}>marIA 2.0</span>
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
    <div className={"w-full font-sans antialiased animate-in fade-in slide-in-from-top-2 duration-500 ease-out" + (isDarkMode && " bg-black")}>
      <div className="relative flex items-center py-4 px-2">
        <div className={`flex-grow border-t ${isDarkMode ? "border-slate-900 shadow-[0_-1px_2px_rgba(255,255,255,0.03)]" : "border-slate-100 shadow-[0_-1px_2px_rgba(0,0,0,0.03)]"}`}></div>
      </div>
      <div className="px-6 pb-6 min-h-[200px] flex flex-col justify-center">
        <div className="flex justify-between items-center mb-6">
          <div className="text-left">
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-slate-50" : "text-slate-950"} tracking-tight`}>marIA 2.0</h2>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">IA Vision System</p>
          </div>
          <button

            onClick={() => { 
              stopCamera();  
              setShowCamera(false); 
              setPreview(null); 
              setResultado(null); 
            }}

            className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer transition-all rounded-full hover:bg-slate-100 active:scale-90"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center space-y-3">
            
          {loading ?  ( //ternarios que gestionan que pasa en cada caso, movil o pc, y si esta cargando o no
            <p>Analitzant...</p>
          ) : isMobile ? ( 

            //  MÓVIL
            <div className={`p-[1px] rounded-full bg-gradient-to-r ${
              isDarkMode
                ? "from-blue-900/50 via-slate-800 to-orange-100/50"
                : "from-blue-100/50 via-slate-200 to-orange-100/50"
            } shadow-sm w-full sm:w-auto`}>
              
              <label
                className={`cursor-pointer flex items-center justify-center space-x-3 w-full sm:min-w-70 px-8 py-3.5
                ${isDarkMode
                  ? "bg-slate-950 text-slate-50 hover:bg-blue-950/50"
                  : "bg-slate-50 text-slate-800 hover:bg-blue-50/50"}
                rounded-full font-semibold tracking-wide transition-all duration-300 ease-out
                hover:shadow-md hover:-translate-y-0.5 active:scale-95`}
              >
                <CameraIcon className={`w-6 h-6 stroke-[1.5] ${
                  isDarkMode ? "text-sky-400" : "text-blue-400"
                }`} />
                
                <span className="text-base">
                  {preview ? "Canviar foto" : "Fer foto"}
                </span>

                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            //  PC
            !stream ? (
              <div className={`p-[1px] rounded-full bg-gradient-to-r ${
                isDarkMode
                  ? "from-blue-900/50 via-slate-800 to-orange-100/50"
                  : "from-blue-100/50 via-slate-200 to-orange-100/50"
              } shadow-sm w-full sm:w-auto`}>

                <button
                  onClick={openCamera}
                  className={`cursor-pointer flex items-center justify-center space-x-3 w-full sm:min-w-70 px-8 py-3.5
                  ${isDarkMode
                    ? "bg-slate-950 text-slate-50 hover:bg-blue-950/50"
                    : "bg-slate-50 text-slate-800 hover:bg-blue-50/50"}
                  rounded-full font-semibold tracking-wide transition-all duration-300 ease-out
                  hover:shadow-md hover:-translate-y-0.5 active:scale-95`}
                >
                  <CameraIcon className={`w-6 h-6 stroke-[1.5] ${
                    isDarkMode ? "text-sky-400" : "text-blue-400"
                  }`} />
                  
                  <span className="text-base">Obrir càmera</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="rounded-xl w-full max-w-xs"
                />
                <button
                  onClick={takePhoto}
                  className="px-4 py-2 bg-green-500 cursor-pointer hover:scale-90 transition-all text-white rounded-full"
                >
                  Fer foto
                </button>
              </div>
            )
          )}
        </div>

          {resultado && (
            <div className="mt-4 p-4 from-blue-50/30 rounded-2xl border border-blue-100/40 shadow-sm animate-in zoom-in-95 slide-in-from-top-2 duration-300">
              <p className={"text-center text-sm italic font-medium leading-relaxed " + (isDarkMode ? "text-white " : "text-black")}>
                "{resultado.descripcio}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}