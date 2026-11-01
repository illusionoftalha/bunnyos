import React, { lazy, Suspense, useState } from 'react';
import BunnyOS98 from './components/BunnyOS98';
import './App.css';

const VirtualMuseum = lazy(() => import('./components/VirtualMuseum'));

const App = () => {
  const [appState, setAppState] = useState('os'); // 'os', 'museum'
  const [isOSOpen, setIsOSOpen] = useState(true);

  const handleEnterMuseum = () => {
    setAppState('museum');
  };

  const handleExitMuseum = () => {
    setAppState('os');
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#008080' }}>
      {appState === 'museum' ? (
        <Suspense fallback={<div role="status" style={{ padding: 24, color: 'white' }}>Loading museum…</div>}>
          <VirtualMuseum onExit={handleExitMuseum} />
        </Suspense>
      ) : (
        <BunnyOS98 
          isOSOpen={isOSOpen} 
          setIsOSOpen={setIsOSOpen} 
          onEnterMuseum={handleEnterMuseum} 
        />
      )}
    </div>
  );
};

export default App;

