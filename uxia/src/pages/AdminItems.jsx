import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminExpoItems from "../components/AdminExpoItems";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { isAdmin, logout, getUsername } from "../utils/auth";
import ExpoDetailView from "../components/ExpoDetailView";
import CookieBanner from '../components/CookieModal';
import { ThemeContext } from '../context/themeContext';

export default function AdminItems() {
  const username = getUsername();
  const navigate = useNavigate();
  const [hasConsent, setHasConsent] = useState(() => {
    return localStorage.getItem('cookie-consent') === 'true';
  });

  useEffect(() => {
    if (!isAdmin()) {
      logout();
      navigate("/admin-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/admin-login");
  };
  
  const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {/* Contenedor principal ajustado para Dark Mode */}
      <div className={`min-h-screen w-full flex flex-col items-center p-4 transition-colors duration-300 ${isDarkMode ? "bg-[#0a0a0a] text-white" : "bg-gray-100 text-gray-900"}`}>

        {/* HEADER DE BIENVENIDA */}
        <div className={`w-full max-w-6xl mb-6 flex justify-between items-center p-6 rounded-2xl shadow-sm ${isDarkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-gray-200"}`}>
          
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? "text-orange-300" : "text-[#162354]"}`}>
              Benvingut,
            </h1>
            <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              {username || "Administrador"}
            </p>
          </div>

          {/* BOTÓN DE LOGOUT MEJORADO */}
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider
              transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg
              ${isDarkMode 
                ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white" 
                : "bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white"
              }
            `}
          >
            {/* Icono simple de salida (opcional) */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sortir
          </button>

        </div>

        {/* VISTA DE DETALLES */}
        <div className="w-full max-w-6xl">
          <ExpoDetailView seleccionado={"IETI CAR SHOW"} isDarkMode={isDarkMode} hasConsent={hasConsent}/>
        </div>

        <CookieBanner isDarkMode={isDarkMode} setHasConsent={setHasConsent} />
      </div>
    </ThemeContext.Provider>
  );
}