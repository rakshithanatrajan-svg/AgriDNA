import React from 'react';
import './index.css';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OTPPage from './pages/OTPPage';
import OnboardingPage from './pages/OnboardingPage';
import AppShell from './components/AppShell';

function Router() {
  const { authState } = useApp();
  switch (authState) {
    case 'landing':    return <LandingPage />;
    case 'login':      return <AuthPage mode="login" />;
    case 'signup':     return <AuthPage mode="signup" />;
    case 'otp':        return <OTPPage />;
    case 'onboarding': return <OnboardingPage />;
    case 'app':        return <AppShell />;
    default:           return <LandingPage />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  );
}
