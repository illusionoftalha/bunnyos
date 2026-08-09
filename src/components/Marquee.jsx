import React from 'react';
import { motion } from 'framer-motion';
import './Marquee.css';

const Marquee = () => {
  return (
    <div className="marquee-container">
      <motion.div 
        className="marquee-track"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 40, repeat: Infinity }}
      >
        <span className="marquee-text">YOU ARE AMAZING ✨ BAREERA ✨ </span>
        <span className="marquee-text">YOU ARE AMAZING ✨ BAREERA ✨ </span>
        <span className="marquee-text">YOU ARE AMAZING ✨ BAREERA ✨ </span>
        <span className="marquee-text">YOU ARE AMAZING ✨ BAREERA ✨ </span>
      </motion.div>
      <motion.div 
        className="marquee-track marquee-track-reverse"
        animate={{ x: ["-50%", "0%"] }}
        transition={{ ease: "linear", duration: 50, repeat: Infinity }}
      >
        <span className="marquee-text">STAY WONDERFUL 🌸 FOREVER 🌸 </span>
        <span className="marquee-text">STAY WONDERFUL 🌸 FOREVER 🌸 </span>
        <span className="marquee-text">STAY WONDERFUL 🌸 FOREVER 🌸 </span>
        <span className="marquee-text">STAY WONDERFUL 🌸 FOREVER 🌸 </span>
      </motion.div>
    </div>
  );
};

export default Marquee;
