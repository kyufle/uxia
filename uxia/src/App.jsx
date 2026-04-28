import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom"; // Importación necesaria
import './App.css';

// Context
import { ThemeContext } from './context/themeContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import Carrousel from './components/Carrousel';
import SelectExpo from './components/SelectExpo';
import { CameraMaria } from './components/CameraMaria';
import CookieBanner from './components/CookieModal';
import { HistorialChat } from './components/HistorialChat';

// Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

// Icons
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

function App() {
  const [seleccionado, setSeleccionado] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [newNotification, setNewNotification] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [hasConsent, setHasConsent] = useState(() => {
    return localStorage.getItem('cookie-consent') === 'true';
  });

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      <BrowserRouter>
        <div className={`flex flex-col min-h-screen w-full relative ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
          
          <Header />

          <Routes>
            {/* 🟢 HOME */}
            <Route path="/" element={
              <main className="flex-1 flex flex-col items-center w-full p-5 overflow-y-auto min-h-0">
                {showHistorial ? (
                  <div className="w-full max-w-2xl mx-auto animate-in fade-in duration-500">
                    <button 
                      onClick={() => setShowHistorial(false)}
                      className={`mb-6 flex items-center gap-2 font-bold hover:opacity-70 transition-opacity ${isDarkMode ? "text-white" : "text-gray-900"}`}
                    >
                      ← Tornar a l'inici
                    </button>
                    <HistorialChat isDarkMode={isDarkMode} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center w-full mt-10">
                    {!showCamera && (
                      <>
                        <div className='w-full max-w-xs md:max-w-md xl:max-w-xl'>
                          <SelectExpo isDarkMode={isDarkMode} seleccionado={seleccionado} setSeleccionado={setSeleccionado} />
                        </div>

                        <div className="my-8 p-3 w-full max-w-xs md:max-w-md xl:max-w-xl">
                          {!seleccionado
                            ? <p className='text-center text-gray-500'> No has seleccionat cap exposició</p>
                            : <Carrousel seleccionado={seleccionado} isDarkMode={isDarkMode} />
                          }
                        </div>
                      </>
                    )}

                    <div className={`w-full max-w-xs md:max-w-md xl:max-w-xl mx-auto p-4 rounded-xl shadow-sm border ${ isDarkMode ? "bg-gray-950 border-gray-800" : "bg-white border-gray-100"}`}>
                      <h2 className={`text-xl md:text-2xl font-semibold ${isDarkMode ? "text-gray-200" : "text-gray-800"} leading-tight`}>
                        Quin cotxe tens davant?
                      </h2>
                      <p className="mt-2 mb-6 text-sm md:text-base text-gray-500 font-light">
                        La nostra intel·ligència artificial l'identificarà a l'instant amb només una foto.
                      </p>
                      <div className="w-full">
                        <CameraMaria 
                          showCamera={showCamera} 
                          isDarkMode={isDarkMode} 
                          setShowCamera={setShowCamera} 
                          hasConsent={hasConsent}
                          onMariaResponse={() => setNewNotification(true)} 
                        />
                      </div>
                    </div>
                  </div>
                )}
              </main>
            } />

            {/* 🔵 ADMIN DASHBOARD */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />

            {/* 🔴 ADMIN LOGIN */}
            <Route path="/admin-login" element={<AdminLogin />} />
          </Routes>

          {/* Botón Flotante Historial (No visible en cámara) */}
          {!showCamera && (
            <button
              onClick={() => {
                setShowHistorial(true);
                setNewNotification(false);
              }}
              className={`fixed bottom-24 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50
                ${isDarkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white"}
                ${newNotification ? "animate-pulse ring-4 ring-blue-400/30 scale-110" : "hover:scale-110 active:scale-95"}
              `}
            >
              <ChatBubbleLeftRightIcon className="w-8 h-8" />
              {newNotification && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-2 border-white"></span>
                </span>
              )}
            </button>
          )}

          <CookieBanner isDarkMode={isDarkMode} setHasConsent={setHasConsent} />
          <Footer isDarkMode={isDarkMode} />
        </div>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

export default App;