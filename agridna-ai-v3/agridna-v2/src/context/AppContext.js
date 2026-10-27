import React, { createContext, useContext, useState, useCallback } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [authState, setAuthState] = useState('landing'); 
  // landing | login | signup | otp | onboarding | app
  const [user, setUser] = useState(null);
  const [lang, setLang] = useState('en');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({});

  const login = useCallback((userData) => {
    setUser(userData);
    setAuthState('app');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAuthState('landing');
  }, []);

  const goTo = useCallback((state) => setAuthState(state), []);

  return (
    <AppContext.Provider value={{
      authState, goTo,
      user, setUser, login, logout,
      lang, setLang,
      voiceEnabled, setVoiceEnabled,
      isListening, setIsListening,
      onboardingStep, setOnboardingStep,
      onboardingData, setOnboardingData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() { return useContext(AppContext); }
