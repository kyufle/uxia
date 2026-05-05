import { useEffect, useState, useContext } from "react";  // añade useContext
import { useNavigate } from "react-router-dom";
import { isAdmin, logout, getUsername } from "../utils/auth";
import ExpoDetailView from "../components/ExpoDetailView";
import CookieBanner from '../components/CookieModal';
import { ThemeContext } from '../context/themeContext';
import CreateItemModal from "../components/CreateItemModal";
import { useParams } from "react-router-dom";
import IATrainButton from "../components/IATrainButton";

export default function AdminItems() {
  const username = getUsername();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { expoId } = useParams();
  const { isDarkMode } = useContext(ThemeContext);  // ← contexto global
  const [hasConsent, setHasConsent] = useState(() => {
    return localStorage.getItem('cookie-consent') === 'true';
  });

  useEffect(() => {
    if (!isAdmin()) {
      logout();
      navigate("/dashboard/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate("/dashboard/login");
  };

  return (
    <div className={`min-h-screen w-full flex flex-col items-center p-4 transition-colors duration-300 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className={`w-full max-w-6xl mb-6 flex justify-between items-center p-6 rounded-2xl shadow-sm ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
        <div>
          <h1 className={`text-2xl font-black tracking-tight ${isDarkMode ? "text-white" : "text-[#162354]"}`}>
            Benvingut,
          </h1>
          <p className={`text-sm font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            {username || "Administrador"}
          </p>
        </div>
        <div className="flex gap-3">
          <IATrainButton expoId={expoId} isDarkMode={isDarkMode} />
          <button
            onClick={() => setIsModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 md:px-5 md:py-2.5 cursor-pointer rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md ${
              isDarkMode
                ? "bg-orange-400 text-black hover:bg-orange-300"
                : "bg-[#162354] text-white hover:bg-blue-900"
            }`}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            
            <span className="hidden sm:inline">Nou Item</span>
            <span className="sm:hidden">Nou</span>
          </button>

          <button //en vez d hacer logout nos manda a la pantalla anterior
            onClick={() => navigate(-1)}
            className={`flex items-center gap-1.5 px-3 py-2 md:px-5 md:py-2.5 cursor-pointer rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md ${
              isDarkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="hidden sm:inline">← Tornar</span>
            <span className="sm:hidden">←</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-6xl">
        <ExpoDetailView key={refreshKey} seleccionado={expoId} isDarkMode={isDarkMode} hasConsent={hasConsent} />
      </div>

      <CreateItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expoSeleccionada={expoId}
        isDarkMode={isDarkMode}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
      <CookieBanner isDarkMode={isDarkMode} setHasConsent={setHasConsent} />
    </div>
  );
}