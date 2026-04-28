import React, { useEffect, useState } from 'react';

export function HistorialChat({ isDarkMode }) {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('https://uxiaweb2.ieti.site/api/get_historial/')
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
      setLoading(false); // Para que no se quede infinitamente cargando
    });
}, []);

  if (loading) return <div className="p-10 text-center text-white font-bold">Carregant historial...</div>;
  
  if (mensajes.length === 0) return (
    <div className={`p-20 text-center rounded-3xl ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
        Encara no tens cap consulta.
    </div>
  );

  return (
    <div className={`w-full min-h-screen font-sans antialiased p-6 ${isDarkMode ? "bg-[#0b1120]" : "bg-slate-50"}`}>
      <div className="max-w-2xl mx-auto">
        {mensajes.map((msg, index) => {
          const showDate = index === 0 || msg.fecha_separador !== mensajes[index - 1].fecha_separador;

          return (
            <div key={msg.id} className="flex flex-col w-full">
              {showDate && (
                <div className="text-center my-10">
                  <h3 className={`text-base font-bold tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}>
                    {msg.fecha_separador}
                  </h3>
                </div>
              )}

              <div className="flex flex-col items-end mb-10 w-full">
                <span className={`text-sm font-bold mb-3 mr-4 ${isDarkMode ? "text-white" : "text-slate-500"}`}>
                  {msg.hora}
                </span>
                <div className="relative mr-4">
                  <div className={`p-4 rounded-[2.5rem] shadow-2xl ${isDarkMode ? "bg-[#f3d7b5]" : "bg-white"} w-72 h-72 flex items-center justify-center`}>
                    <img 
                      src={`https://uxiaweb2.ieti.site${msg.car_photo}`} 
                      alt="Captura" 
                      className="w-full h-full object-cover rounded-[1.5rem]"
                    />
                  </div>
                  <div className={`absolute -bottom-2 right-8 w-10 h-10 rotate-[20deg] ${isDarkMode ? "bg-[#f3d7b5]" : "bg-white"} rounded-bl-3xl shadow-lg`}></div>
                </div>
              </div>

              <div className="flex flex-col items-start mb-16 w-full">
                <span className={`text-sm font-bold mb-3 ml-4 ${isDarkMode ? "text-white" : "text-slate-500"}`}>
                  {msg.hora}
                </span>
                <div className="relative ml-4 max-w-[85%]">
                  <div className={`py-8 px-10 rounded-[2.5rem] shadow-2xl border-t border-white/10 ${isDarkMode ? "bg-[#5e7089]" : "bg-white"}`}>
                    <p className={`text-xl font-medium leading-relaxed italic ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                      “ {msg.maria_answers} ”
                    </p>
                  </div>
                  <div className={`absolute -bottom-3 left-8 w-12 h-12 -rotate-[15deg] ${isDarkMode ? "bg-[#5e7089]" : "bg-white"} rounded-br-3xl shadow-xl`}></div>
                </div>
              </div>

              {index === mensajes.length - 1 && (
                <div className={`w-full border-t-2 mt-4 mb-20 ${isDarkMode ? "border-white/20" : "border-slate-900"}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}