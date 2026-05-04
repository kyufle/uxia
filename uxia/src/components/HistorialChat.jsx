import React, { useEffect, useState, useRef } from 'react'; // 1. Añadimos useRef
import config from "../config"; 
import { useTranslation } from 'react-i18next';

export function HistorialChat({ isDarkMode }) {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const {t} = useTranslation();
  // 2. Referencia para el final de la lista
  const messagesEndRef = useRef(null);

  const getUserIdFromCookie = () => {
    const name = "uxia_user_id=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i].trim();
      if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
    }
    return "anonim";
  };

  // Función para hacer scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const userId = getUserIdFromCookie();
    fetch(`${config.API_URL}/api/get_historial/?user_id=${userId}`)
      .then(res => {
        if (!res.ok) throw new Error("Error en la red o 404");
        return res.json();
      })
      .then(data => {
        setMensajes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar historial:", err);
        setLoading(false);
      });
  }, []);

  // 3. Efecto que se dispara cuando los mensajes cambian o termina de cargar
  useEffect(() => {
    if (!loading && mensajes.length > 0) {
      scrollToBottom();
    }
  }, [mensajes, loading]);

  if (loading) return (
    <div className={`p-10 text-center font-bold ${isDarkMode ? "text-white" : "text-slate-900"}`}>
      Carregant historial...
    </div>
  );
  
  if (mensajes.length === 0) return (
    <div className={`p-10 md:p-20 text-center rounded-3xl ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
        {t('landingPage.history.notappointment')}
    </div>
  );

  return (
    <div className={`w-full font-sans antialiased p-4 md:p-6 ${isDarkMode ? "bg-[#0b1120]" : "bg-slate-50"}`}>
      <div className="max-w-xl mx-auto">
        {mensajes.map((msg, index) => {
          const showDate = index === 0 || msg.fecha_separador !== mensajes[index - 1].fecha_separador;

          return (
            <div key={msg.id} className="flex flex-col w-full">
              {showDate && (
                <div className="text-center my-6 md:my-8">
                  <h3 className={`text-xs md:text-sm font-bold tracking-tight uppercase opacity-60 ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    {msg.fecha_separador}
                  </h3>
                </div>
              )}
              <div className="flex flex-col items-end mb-6 md:mb-8 w-full">
                <span className={`text-[10px] md:text-xs font-bold mb-2 mr-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  {msg.hora}
                </span>
                <div className="relative mr-2 z-0">
                  <div className={`relative z-10 p-2 md:p-3 rounded-[1.5rem] md:rounded-[2rem] shadow-xl ${isDarkMode ? "bg-[#f3d7b5]" : "bg-white"} w-48 h-48 md:w-64 md:h-64 flex items-center justify-center`}>
                    <img 
                      src={msg.car_photo.startsWith('http') ? msg.car_photo : `${config.API_URL}${msg.car_photo}`} 
                      alt="Captura" 
                      className="w-full h-full object-cover rounded-[1rem] md:rounded-[1.2rem]"
                    />
                  </div>
                  <div className={`absolute -bottom-2 right-6 w-8 h-8 md:w-12 md:h-12 rotate-[15deg] ${isDarkMode ? "bg-[#f3d7b5]" : "bg-white"} rounded-bl-3xl shadow-lg -z-10`}></div>
                </div>
              </div>

              <div className="flex flex-col items-start mb-10 md:mb-12 w-full">
                <span className={`text-[10px] md:text-xs font-bold mb-2 ml-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  {msg.hora}
                </span>
                <div className="relative ml-2 max-w-[90%] md:max-w-[85%] z-0">
                  <div className={`relative z-10 py-4 px-6 md:py-6 md:px-8 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border-t border-white/10 ${isDarkMode ? "bg-[#5e7089]" : "bg-white"}`}>
                    <p className={`text-sm md:text-lg font-medium leading-relaxed italic ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                      “ {msg.maria_answers} ”
                    </p>
                  </div>
                  <div className={`absolute -bottom-2 left-6 w-8 h-8 md:w-12 md:h-12 -rotate-[15deg] ${isDarkMode ? "bg-[#5e7089]" : "bg-white"} rounded-br-3xl shadow-xl -z-10`}></div>
                </div>
              </div>

              {index === mensajes.length - 1 && (
                <div className={`w-full border-t-2 mt-4 mb-2 ${isDarkMode ? "border-white/20" : "border-slate-900 opacity-10"}`}></div>
              )}
            </div>
          );
        })}
        {/* 4. Div invisible que marca el final para el scroll */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}