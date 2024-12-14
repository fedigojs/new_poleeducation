import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en/translation.json';
import uaTranslation from './locales/ua/translation.json';

const resources = {
    en: {
        translation: enTranslation,
    },
    ua: {
        translation: uaTranslation,
    },
};

i18n.use(initReactI18next).init({
    resources,
    lng: 'ua',
    fallbackLng: 'ua',
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
