import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let startTime = null;
    const duration = 2500; // 2.5 seconds to reach 100%

    const animateProgress = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsedTime = timestamp - startTime;
      
      const newProgress = Math.min(Math.floor((elapsedTime / duration) * 100), 100);
      setProgress(newProgress);

      if (elapsedTime < duration) {
        requestAnimationFrame(animateProgress);
      } else {
        setTimeout(onComplete, 800); // Wait slightly at 100% before transitioning
      }
    };

    requestAnimationFrame(animateProgress);
  }, [onComplete]);

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: '#ffffff',
        zIndex: 999999, // Highest possible
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
    >
      <motion.p
        className="serif"
        style={{
          fontSize: '4rem',
          color: 'var(--color-deep-pink)',
          fontWeight: '300',
          letterSpacing: '5px',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {progress}%
      </motion.p>
    </motion.div>
  );
};

export default Preloader;
