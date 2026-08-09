import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SecretLetter.css';

const SECRET_WORD = 'bunny';

const SecretLetter = () => {
  const [inputBuffer, setInputBuffer] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if unlocked or typing in an input field
      if (isUnlocked || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();
      
      // Only keep alphanumeric characters
      if (key.length === 1 && /[a-z0-9]/.test(key)) {
        setInputBuffer((prev) => {
          const newBuffer = (prev + key).slice(-SECRET_WORD.length);
          if (newBuffer === SECRET_WORD) {
            setIsUnlocked(true);
          }
          return newBuffer;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isUnlocked]);

  return (
    <AnimatePresence>
      {isUnlocked && (
        <motion.div
          className="secret-letter-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          {/* Spotlight Effect */}
          <div className="secret-spotlight" />
          
          <motion.div 
            className="secret-letter-container glass"
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
          >
            <p className="secret-greeting serif">My Dearest Bareera,</p>
            <div className="secret-divider" />
            <p className="secret-body serif">
              If you are reading this, you found the secret I left just for you.<br/><br/>
              I wanted to build you something that wasn't just a website, but a reflection of the profound warmth and absolute serendipity you bring to the world.<br/><br/>
              Every pixel, every soft light, and every falling petal here was crafted as a digital sanctuary for your spirit. You are entirely unforgettable, and I hope this small corner of the internet makes you smile whenever you need it.
            </p>
            <p className="secret-signoff serif">With all my affection,</p>
            
            <button 
              className="secret-close-btn serif"
              onClick={() => setIsUnlocked(false)}
            >
              [ Close Letter ]
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SecretLetter;
