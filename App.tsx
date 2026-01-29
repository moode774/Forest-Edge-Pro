import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './src/pages/Login';
import Dashboard from './src/pages/Dashboard';
import Editor from './src/pages/Editor';
import Maintenance from './src/pages/Maintenance';
import Home from './src/pages/Home';
import History from './src/pages/History';
import VeneerManager from './src/pages/VeneerManager';
import Settings from './src/pages/Settings';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { LanguageProvider } from './src/context/LanguageContext';
import { ThemeProvider } from './src/context/ThemeContext';

function AppContent() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to system settings for kill switch
    const unsub = onSnapshot(doc(db, 'settings', 'system'), (doc) => {
      if (doc.exists()) {
        setIsMaintenance(doc.data().isMaintenanceMode || false);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to system status:", error);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFB] dark:bg-[#1c1917] flex items-center justify-center transition-colors">
        <div className="w-12 h-12 border-4 border-[#1c1917] dark:border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isMaintenance) {
    return <Maintenance />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:id" element={<Editor />} />
        <Route path="/veneers" element={<VeneerManager />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
}