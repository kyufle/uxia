import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { isAdmin, logout, getUsername } from "../utils/auth";
import ExpoDetailView from "../components/ExpoDetailView";
import CookieBanner from "../components/CookieModal";
import { ThemeContext } from "../context/themeContext";
import CreateItemModal from "../components/CreateItemModal";
import IATrainButton from "../components/IATrainButton";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AdminItems() {
  const username = getUsername();
  const navigate = useNavigate();
  const { expoId } = useParams();
  const { isDarkMode } = useContext(ThemeContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [hasConsent, setHasConsent] = useState(() => {
    return localStorage.getItem("cookie-consent") === "true";
  });

  const {t} = useTranslation();

  useEffect(() => {
    if (!isAdmin()) {
      logout();
      navigate("/dashboard/login");
    }
  }, [navigate]);

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center p-4 transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* HEADER */}
      <div
        className={`w-full max-w-6xl mb-6 p-4 md:p-6 rounded-2xl shadow-sm ${
          isDarkMode
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* LEFT */}
          <div className="flex flex-col">
            <h1
              className={`text-xl md:text-2xl font-black tracking-tight ${
                isDarkMode ? "text-white" : "text-[#162354]"
              }`}
            >
              Benvingut,
            </h1>
            <p
              className={`text-sm font-medium ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {username || "Administrador"}
            </p>
          </div>

          {/* RIGHT - FIXED LAYOUT */}
        <div className="w-full lg:w-auto grid grid-cols-2 sm:flex sm:flex-wrap md:flex-nowrap items-stretch gap-3 justify-center md:justify-end">
          
          <div className="col-span-2 sm:col-auto flex">
            <IATrainButton expoId={expoId} />
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl text-xs md:text-base font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md ${
              isDarkMode
                ? "bg-orange-400 text-black hover:bg-orange-300"
                : "bg-[#162354] text-white hover:bg-blue-900"
            }`}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span className="whitespace-nowrap">Nou Item</span>
          </button>

          <button
            onClick={() => navigate(-1)}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl text-xs md:text-base font-bold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-md ${
              isDarkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <span className="whitespace-nowrap">← Tornar</span>
          </button>
        </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="w-full max-w-6xl">
        <ExpoDetailView
          key={refreshKey}
          seleccionado={expoId}
          isDarkMode={isDarkMode}
          hasConsent={hasConsent}
        />
      </div>

      {/* MODAL */}
      <CreateItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expoSeleccionada={expoId}
        isDarkMode={isDarkMode}
        onSuccess={() => setRefreshKey((prev) => prev + 1)}
      />

      <CookieBanner isDarkMode={isDarkMode} setHasConsent={setHasConsent} />
    </div>
  );
}