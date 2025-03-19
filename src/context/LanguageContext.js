import { createContext, useState } from "react";

export const LanguageContext = createContext();

export  function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("ja"); 

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "ja" ? "en" : "ja"));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageContext;
