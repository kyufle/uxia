import React, { useState, useEffect } from 'react';
import { SpeakerWaveIcon, StopIcon } from '@heroicons/react/24/outline';

const VoiceButton = ({ text, isDarkMode, language }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const langMap = {
    ca: 'ca-ES',
    en: 'en-US',
    fr: 'fr-FR',
    es: 'es-ES'
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const rawLang = language || localStorage.getItem('i18nextLng') || 'ca';
    const cleanLang = rawLang.split('-')[0].toLowerCase();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[cleanLang] || 'ca-ES';
    utterance.pitch = 1;
    utterance.rate = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis Error:", e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => window.speechSynthesis.cancel();
  }, []);

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleSpeak}
        className={`mt-3 flex items-center justify-center p-3 rounded-full transition-all duration-300 shadow-sm ${
          isDarkMode 
            ? "bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-700" 
            : "bg-white hover:bg-blue-50 text-blue-500 border border-blue-100"
        } ${isSpeaking ? "scale-110 ring-2 ring-blue-400" : "hover:scale-105"}`}
        title={isSpeaking ? "Aturar" : "Escoltar descripció"}
      >
        {isSpeaking ? (
          <StopIcon className="w-6 h-6 animate-pulse" />
        ) : (
          <SpeakerWaveIcon className="w-6 h-6" />
        )}
      </button>
      <span className={`text-[10px] mt-1 font-medium uppercase tracking-tighter ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
        {isSpeaking ? "Reproduint..." : "Reproduir"}
      </span>
    </div>
  );
};

export default VoiceButton;