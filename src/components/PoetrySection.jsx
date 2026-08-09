import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import './PoetrySection.css';
import GirlishSecretLetter from './GirlishSecretLetter';
import { uiSounds } from '../utils/UISounds';

const verses = [
  "You are the quiet poetry the world writes when it finally decides to be kind.",
  "There is a gentle gravity to your presence, pulling the light into every room you enter.",
  "I hope you never doubt the profound beauty of your own existence; you are entirely, undeniably unforgettable."
];

const WordReveal = ({ text, onSecretTrigger }) => {
  const words = text.split(" ");
  const containerRef = useRef(null);
  
  // Track scroll position for this specific paragraph
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 40%"] // Start animating when top hits 80% of viewport, finish when bottom hits 40%
  });

  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef(null);

  const handleWordClick = (word) => {
    // Check if the word is "unforgettable." (ignoring punctuation just in case)
    if (word.toLowerCase().includes("unforgettable")) {
      setClickCount(prev => {
        const newCount = prev + 1;
        if (newCount === 2) {
          // Trigger secret!
          uiSounds.playCinematicWhoosh(); // Play a nice sound
          onSecretTrigger();
          return 0; // reset
        }
        return newCount;
      });

      // Reset count after 1 second of inactivity
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => clearTimeout(clickTimeoutRef.current);
  }, []);

  return (
    <p className="poetry-verse serif" ref={containerRef}>
      {words.map((word, index) => {
        // Calculate the individual fill percentage for each word
        const start = index / words.length;
        const end = start + (1 / words.length);
        
        // This opacity goes from 0.15 (faint) to 1 (solid) as scroll passes the word's "range"
        const opacity = useTransform(scrollYProgress, [start, end], [0.15, 1]);

        return (
          <motion.span 
            key={index} 
            onClick={() => handleWordClick(word)}
            style={{ 
              opacity,
              display: 'inline-block', 
              marginRight: '0.3em',
              transition: 'opacity 0.1s ease-out',
              cursor: word.toLowerCase().includes("unforgettable") ? 'pointer' : 'default'
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </p>
  );
};

const PoetrySection = () => {
  const [isSecretRevealed, setIsSecretRevealed] = useState(false);

  return (
    <section className="poetry-section">
      <div className="poetry-container">
        <AnimatePresence mode="wait">
          {!isSecretRevealed ? (
            <motion.div 
              key="poetry"
              initial={{ opacity: 1 }}
              exit={{ 
                opacity: 0, 
                filter: "blur(15px)", 
                y: -50,
                scale: 0.95
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="poetry-content-wrapper"
              style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12rem' }}
            >
              {verses.map((verse, index) => (
                <div key={index} className={`poetry-card-wrapper card-${index}`}>
                  <span className="massive-quote serif">"</span>
                  <div className="poetry-card glass-panel">
                    <WordReveal 
                      text={verse} 
                      onSecretTrigger={() => setIsSecretRevealed(true)} 
                    />
                  </div>
                </div>
              ))}
              
              <motion.div 
                className="poetry-signature-container"
                initial={{ opacity: 0, filter: "blur(5px)" }}
                whileInView={{ opacity: 1, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 2, delay: 0.5 }}
                style={{ marginTop: '-4rem' }}
              >
                <div className="signature-line" />
                <p className="poetry-signature serif">For Bareera.</p>
              </motion.div>
            </motion.div>
          ) : (
            <GirlishSecretLetter key="secret" onClose={() => setIsSecretRevealed(false)} />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PoetrySection;
