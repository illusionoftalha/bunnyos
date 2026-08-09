import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroSequence = ({ onComplete }) => {
  useEffect(() => {
    // Automatically complete the intro sequence after 6 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 6000);
    return () => clearTimeout(timer);
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
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 2, ease: "easeInOut" } }}
      transition={{ duration: 1.5 }}
    >
      <motion.p
        className="serif"
        style={{
          fontSize: '2rem',
          color: '#333',
          fontStyle: 'italic',
          letterSpacing: '2px',
          textAlign: 'center',
        }}
        initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        transition={{ duration: 2, delay: 1.5, ease: "easeOut" }}
      >
        Close your eyes, take a breath, and step inside...
      </motion.p>
    </motion.div>
  );
};

export default IntroSequence;
