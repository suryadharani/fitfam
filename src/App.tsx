import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NeuralBackground } from './components/NeuralBackground';
import { Navbar } from './components/landing/Navbar';
import { HeroSection } from './components/landing/HeroSection';
import { InteractivePreview } from './components/landing/InteractivePreview';
import { HowItWorks } from './components/landing/HowItWorks';
import { FlexibleFamilySection } from './components/landing/FlexibleFamilySection';
import { InsightsSection } from './components/landing/InsightsSection';
import { Footer } from './components/landing/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { WorkspaceView } from './components/workspace/WorkspaceView';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authModalState, setAuthModalState] = useState<{
    isOpen: boolean;
    mode: 'signin' | 'signup' | 'reset';
  }>({
    isOpen: false,
    mode: 'signin'
  });

  const handleOpenAuth = (mode: 'signin' | 'signup' | 'reset') => {
    setAuthModalState({ isOpen: true, mode });
  };

  const handleCloseAuth = () => {
    setAuthModalState((prev) => ({ ...prev, isOpen: false }));
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-deep)', color: 'var(--text-secondary)' }}>
        <NeuralBackground />
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '2.4rem', display: 'block', marginBottom: '12px' }}>🌿</span>
          <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>Loading FitFam...</p>
        </div>
      </div>
    );
  }

  // Authenticated View -> Render Real Family Workspace
  if (user) {
    return (
      <div className="app-shell" style={{ minHeight: '100vh', position: 'relative' }}>
        <NeuralBackground />
        <WorkspaceView />
      </div>
    );
  }

  // Unauthenticated View -> Render Public Landing Page (100% In-Memory Interactive Preview)
  return (
    <div className="app-shell" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Living Biological Canvas Background */}
      <NeuralBackground />

      {/* Header */}
      <Navbar onOpenAuth={handleOpenAuth} />

      {/* Main Landing & Demo Sections */}
      <main style={{ flex: 1 }}>
        <HeroSection onOpenAuth={handleOpenAuth} />
        <InteractivePreview />
        <HowItWorks />
        <FlexibleFamilySection />
        <InsightsSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Firebase Auth Modal */}
      <AuthModal
        isOpen={authModalState.isOpen}
        initialMode={authModalState.mode}
        onClose={handleCloseAuth}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
