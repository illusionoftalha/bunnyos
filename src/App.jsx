import React, { useState } from 'react';
import BunnyOS98 from './components/BunnyOS98';
import VirtualMuseum from './components/VirtualMuseum';
import './App.css';

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
        <VirtualMuseum onExit={handleExitMuseum} />
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

