import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import './LoveLetters.css';

const letters = [
  { text: "Your smile is my favorite piece of art.", rotate: -15, x: -250, y: -150 },
  { text: "You make the ordinary look incredibly beautiful.", rotate: 8, x: -100, y: -180 },
  { text: "In a room full of art, I'd still stare at you.", rotate: -25, x: 150, y: -160 },
  { text: "There is poetry in the way you exist.", rotate: 12, x: 300, y: -120 },
  { text: "You are the quiet peace I always search for.", rotate: -5, x: -350, y: -50 },
  { text: "A mind as beautiful as your soul.", rotate: 22, x: -180, y: -80 },
  { text: "You carry the warmth of a golden hour.", rotate: -18, x: 50, y: -90 },
  { text: "Even the stars would be jealous of your light.", rotate: 14, x: 250, y: -40 },
  { text: "Your laughter is my favorite melody.", rotate: -8, x: 380, y: 20 },
  { text: "You are effortlessly elegant.", rotate: 25, x: -320, y: 60 },
  { text: "Everything is softer when you are around.", rotate: -12, x: -150, y: 30 },
  { text: "A heart of gold and a spirit of fire.", rotate: 18, x: 80, y: 10 },
  { text: "You make the world a little less heavy.", rotate: -22, x: 220, y: 70 },
  { text: "I see oceans of kindness in your eyes.", rotate: 5, x: 350, y: 120 },
  { text: "You are a masterpiece in progress.", rotate: -15, x: -280, y: 160 },
  { text: "Your presence feels like a deep breath.", rotate: 30, x: -80, y: 140 },
  { text: "There is magic in your very existence.", rotate: -5, x: 120, y: 180 },
  { text: "You bloom beautifully in every season.", rotate: 20, x: 280, y: 190 },
  { text: "Grace follows you like a shadow.", rotate: -25, x: 0, y: -20 },
  { text: "You are my favorite serendipity.", rotate: 10, x: -40, y: 220 }
];

const LoveLetters = () => {
  const constraintsRef = useRef(null);

  return (
    <section className="love-letters-section" ref={constraintsRef}>
      <motion.div 
        className="love-letters-header"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="serif">Little Notes For You</h2>
        <p className="serif italic" style={{color: '#888'}}>(Grab and move them)</p>
      </motion.div>

      <div className="letters-sandbox">
        {letters.map((letter, index) => (
          <motion.div
            key={index}
            className="physics-letter glass"
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            whileDrag={{ scale: 1.1, zIndex: 10, cursor: 'grabbing' }}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, scale: 0, rotate: letter.rotate, x: letter.x, y: letter.y }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: index * 0.2 }}
          >
            <div className="letter-pin" />
            <p className="letter-text serif">{letter.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default LoveLetters;
