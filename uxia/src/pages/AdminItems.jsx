import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAdmin, logout, getUsername } from "../utils/auth";
import ExpoDetailView from "../components/ExpoDetailView";
import CookieBanner from '../components/CookieModal';
import { ThemeContext } from '../context/themeContext';
import CreateItemModal from "../components/CreateItemModal"; // IMPORTANTE

export default function AdminItems() {
  const username = getUsername();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar recarga de items

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

  const expoActual = "IETI CAR SHOW";

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      <div className={`min-h-screen w-full flex flex-col items-center p-4 transition-colors duration-300 ${isDarkMode ? "bg-[#0a0a0a] text-white" : "bg-gray-100 text-gray-900"}`}>

        {/* HEADER */}
        <div className={`w-full max-w-6xl mb-6 flex justify-between items-center p-6 rounded-2xl shadow-sm ${isDarkMode ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-gray-200"}`}>
          
          <div>
            <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? "text-orange-300" : "text-[#162354]"}`}>
              Benvingut,
            </h1>
            <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              {username || "Administrador"}
            </p>
          </div>

          <div className="flex gap-3">
            {/* BOTÓN NUEU ITEM */}
            <button
              onClick={() => setIsModalOpen(true)}
              className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md ${
                isDarkMode 
                ? "bg-orange-300 text-black hover:bg-orange-400" 
                : "bg-[#162354] text-white hover:bg-blue-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Nou Item
            </button>

            <button
              onClick={handleLogout}
              className={`cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md ${
                isDarkMode 
                ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-50" 
                : "bg-red-50 text-red-600 border border-red-100 hover:bg-red-600 hover:text-white"
              }`}
            >
              Sortir
            </button>
          </div>
        </div>

        {/* VISTA DE DETALLES */}
        <div className="w-full max-w-6xl">
          {/* Añadimos refreshKey para que cuando creemos uno, se refresque la lista */}
          <ExpoDetailView key={refreshKey} seleccionado={expoActual} isDarkMode={isDarkMode} hasConsent={hasConsent}/>
        </div>

        {/* MODAL */}
        <CreateItemModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)}
            expoSeleccionada={expoActual}
            isDarkMode={isDarkMode}
            onSuccess={() => setRefreshKey(prev => prev + 1)}
        />

        <CookieBanner isDarkMode={isDarkMode} setHasConsent={setHasConsent} />
      </div>
    </ThemeContext.Provider>
  );
}