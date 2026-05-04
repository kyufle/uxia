import i18next from 'i18next'; // Quitamos loadResources si no lo usas
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './i18n/en';
import esTranslation from './i18n/es';
import caTranslation from './i18n/ca';
import frTranslation from './i18n/fr';

i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        resources: {
            en: {
                translation: enTranslation,
            },
            es: {
                translation: esTranslation,
            },
            ca: {
                translation: caTranslation,
            },
            fr: {
                translation: frTranslation,
            }
        }
    });

export const languages = ["en", "es", "ca", "fr"];
export default i18next;