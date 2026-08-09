import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import './Envelope.css';
import MagneticElement from './MagneticElement';

const Envelope = ({ onOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExploding, setIsExploding] = useState(false);

  const handleClick = () => {
    setIsOpen(true);
    setTimeout(() => {
      setIsExploding(true);
      setTimeout(() => {
        onOpen();
      }, 1000);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {!isExploding && (
        <motion.div 
          className="envelope-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <MagneticElement strength={20}>
            <div className={`envelope-container ${isOpen ? 'open' : ''}`} onClick={!isOpen ? handleClick : undefined}>
              <div className="envelope-flap" />
              <div className="envelope-body" />
              <div className="envelope-front" />
              <div className="envelope-seal hover-target">
                <Heart size={24} fill="white" color="white" />
              </div>
              {isOpen && (
                <motion.div 
                  className="envelope-letter"
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: -100, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5, ease: "backOut" }}
                >
                  <p>For Bareera ✨</p>
                </motion.div>
              )}
            </div>
          </MagneticElement>
          
          <motion.p 
            className="envelope-hint"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            Click to open
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Envelope;
