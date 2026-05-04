import React from 'react';
import { useTranslation } from 'react-i18next';

const Selecti18n = ({ isDarkMode }) => {
  const { i18n } = useTranslation();

  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  const languageNames = {
    en: "English",
    es: "Español",
    ca: "Català",
    fr: "Français"
  };

  return (
    <div className="ml-auto relative flex items-center">
      <select 
        value={i18n.language.substring(0, 2)}
        onChange={changeLanguage}
        className={`
          appearance-none cursor-pointer pr-8 pl-3 py-1.5 rounded-md border transition-all duration-300 outline-none font-medium
          ${isDarkMode 
            ? "bg-gray-800 text-gray-200 border-gray-600 focus:border-blue-400" 
            : "bg-white text-gray-800 border-gray-300 focus:border-blue-500"}
        `}
      >
        {Object.keys(languageNames).map((lng) => (
          <option 
            key={lng} 
            value={lng} 
            className={isDarkMode ? "bg-gray-800 text-white" : "bg-white text-black"}
          >
            {languageNames[lng]}
          </option>
        ))}
      </select>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
        <svg 
            className={`h-4 w-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default Selecti18n;