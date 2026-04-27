import React, { useState, useEffect } from 'react';

const CookieModal = ({ isDarkMode, setHasConsent }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);
const acceptCookies = () => {
  localStorage.setItem('cookie-consent', 'true');
  setHasConsent(true);
  location.reload();
  // window.gtag?.('consent', 'update', {
  //   'analytics_storage': 'granted'
  // });

  setIsVisible(false);
};

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[10000] flex items-center justify-center p-6 backdrop-blur-sm transition-opacity duration-300">
      <div className={`w-full max-w-lg p-8 rounded-2xl shadow-2xl transition-all duration-300 transform scale-100 ${
        isDarkMode 
          ? 'bg-gray-900 text-white border border-gray-800' 
          : 'bg-white text-gray-800 border border-gray-100'
      }`}>
        
        <div className="flex flex-col items-center text-center gap-6">
          <div className="bg-blue-100 dark:bg-blue-950 p-4 rounded-full text-blue-600 dark:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-bold tracking-tight">La teva privacitat ens importa</h3>
            <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Utilitzem cookies per a millorar la teva experiència.
              {/* <a href="/politica-cookies" className="underline ml-1 hover:text-blue-500 font-medium">Política de Cookies</a>. */}
            </p>
          </div>

          <button 
            onClick={acceptCookies}
            className="w-full mt-2 px-10 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-lg shadow-blue-900/20 active:scale-[0.98]"
          >
            Aceptar totes
          </button>
        </div>

      </div>
    </div>
  );
};

export default CookieModal;