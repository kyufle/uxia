import React, { useState, useEffect, useRef } from 'react';
import { SpeakerWaveIcon, StopIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

const VoiceButton = ({ text, isDarkMode, language }) => {
  const {t} = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synth = window.speechSynthesis;

  const langMap = {
    ca: 'ca-ES',
    en: 'en-US',
    fr: 'fr-FR',
    es: 'es-ES'
  };

  const getSystemVoices = () => {
    return new Promise((resolve) => {
      let voices = synth.getVoices();
      if (voices.length > 0) {
        resolve(voices);
        return;
      }
      synth.onvoiceschanged = () => {
        voices = synth.getVoices();
        resolve(voices);
      };
    });
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      synth.cancel();
      setIsSpeaking(false);
      return;
    }

    synth.cancel();

    const rawLang = language || localStorage.getItem('i18nextLng') || 'ca';
    const cleanLang = rawLang.split('-')[0].toLowerCase();
    const targetLang = langMap[cleanLang] || 'ca-ES';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetLang;
    const voices = await getSystemVoices();
    
    const selectedVoice = 
      voices.find(v => v.lang === targetLang && v.name.includes('Google')) ||
      voices.find(v => v.lang === targetLang) || 
      voices.find(v => v.lang.startsWith(cleanLang));

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log("Voz seleccionada:", selectedVoice.name, selectedVoice.lang);
    } else {
      console.warn("No se encontró voz específica para:", targetLang);
    }

    utterance.pitch = 1;
    utterance.rate = 0.95;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  };

  useEffect(() => {
    return () => synth.cancel();
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
      >
        {isSpeaking ? (
          <StopIcon className="w-6 h-6 animate-pulse" />
        ) : (
          <SpeakerWaveIcon className="w-6 h-6" />
        )}
      </button>
      <span className={`text-[10px] mt-1 font-medium uppercase tracking-tighter ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
        {isSpeaking ? t('landingPage.maria.stop'): t('landingPage.maria.play')}
      </span>
    </div>
  );
};

export default VoiceButton;