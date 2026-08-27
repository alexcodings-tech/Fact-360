import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
// Other languages temporarily disabled — only English is exposed.
// import ta from "./locales/ta.json";
// import ml from "./locales/ml.json";
// import kn from "./locales/kn.json";
// import te from "./locales/te.json";

export const SUPPORTED_LANGS = [
  { code: "en", label: "English", native: "English" },
  // { code: "ta", label: "Tamil", native: "தமிழ்" },
  // { code: "ml", label: "Malayalam", native: "മലയാളം" },
  // { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  // { code: "te", label: "Telugu", native: "తెలుగు" },
] as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { t: en },
      // ta: { t: ta },
      // ml: { t: ml },
      // kn: { t: kn },
      // te: { t: te },
    },
    lng: "en",
    fallbackLng: "en",
    defaultNS: "t",
    interpolation: { escapeValue: false },
  });
}

if (typeof window !== "undefined") {
  const stored = localStorage.getItem("lang");
  const allowed = SUPPORTED_LANGS.map((l) => l.code);
  if (stored && allowed.includes(stored as any) && stored !== i18n.language) {
    setTimeout(() => i18n.changeLanguage(stored), 0);
  } else if (stored && !allowed.includes(stored as any)) {
    localStorage.setItem("lang", "en");
    setTimeout(() => i18n.changeLanguage("en"), 0);
  }
}

export function setLang(code: string) {
  i18n.changeLanguage(code);
  if (typeof window !== "undefined") localStorage.setItem("lang", code);
}

export default i18n;
