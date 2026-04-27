import { useEffect } from "react";
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function ThemeButton({ isDarkMode, setIsDarkMode }) {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e) => setIsDarkMode(e.matches);

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [setIsDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        cursor-pointer relative w-14 h-14 flex items-center justify-center
        rounded-full transition-all duration-500 ease-in-out
        shadow-md border ml-auto overflow-hidden
        ${isDarkMode 
          ? "bg-yellow-400 border-yellow-300 rotate-180" 
          : "bg-gray-900 border-gray-700 rotate-0"
        }
      `}
    >
      {/* Glow */}
      <span className={`
        absolute inset-0 rounded-full opacity-30
        ${isDarkMode ? "bg-yellow-300" : "bg-gray-800"}
      `} />

      {/* Icon */}
      {isDarkMode ? (
        <MoonIcon className="w-6 h-6 text-black relative z-10" />
      ) : (
        <SunIcon className="w-6 h-6 text-yellow-400 relative z-10" />
      )}
    </button>
  );
}