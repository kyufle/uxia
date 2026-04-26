import { useEffect } from "react";

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
        relative w-14 h-14 flex items-center justify-center
        rounded-full transition-all duration-500 ease-in-out
        shadow-md border
        ml-auto
        ${isDarkMode 
          ? "bg-yellow-400 text-gray-900 border-yellow-300 rotate-180" 
          : "bg-gray-900 text-yellow-400 border-gray-700 rotate-0"
        }
      `}
    >
      <span className={`text-2xl transition-colors duration-300 ${isDarkMode ? "text-yellow-300" : "text-gray-900"}`}>
        ☀️
      </span>
      <span className={`
        absolute inset-0 rounded-full blur-md opacity-30 transition-all duration-500
        ${isDarkMode ? "bg-yellow-300" : "bg-gray-800"}
      `} />
    </button>
  );
}