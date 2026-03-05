import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import ka from "./ka.json";
import ru from "./ru.json";

const saved = typeof window !== "undefined" ? window.localStorage.getItem("lang") : null;

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ka: { translation: ka },
    ru: { translation: ru },
  },
  lng: saved || "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
