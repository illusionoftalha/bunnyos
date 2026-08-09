import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Flower } from 'lucide-react';
import { uiSounds } from '../utils/UISounds';
import './MuseumGateSection.css';

const MuseumGateSection = ({ onEnterMuseum }) => {
  return (
    <section className="museum-gate-section">

      {/* The content hidden behind the giant doors */}
      <div className="gate-content-behind">
        <div className="gate-ambient-glow" />

        {/* Floating Decorations */}
        <motion.div className="floating-decor decor-1" animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}><Flower size={48} color="#ffb6c1" /></motion.div>
        <motion.div className="floating-decor decor-2" animate={{ y: [0, 30, 0], scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity }}><Heart size={40} color="#ff69b4" fill="#ff69b4" /></motion.div>
        <motion.div className="floating-decor decor-3" animate={{ y: [0, -15, 0], rotate: [0, -15, 15, 0] }} transition={{ duration: 6, repeat: Infinity }}><Flower size={42} color="#ffc0cb" /></motion.div>
        <motion.div className="floating-decor decor-4" animate={{ y: [0, 40, 0], scale: [1, 1.1, 1] }} transition={{ duration: 4.5, repeat: Infinity }}><Heart size={50} color="#ff1493" fill="#ff1493" opacity={0.6} /></motion.div>

        <h2 className="gate-title serif">Our Museum 🌸</h2>
        <p className="gate-subtitle sans">Step into our dimension of memories.</p>

        <motion.button
          className="gate-unlock-btn"
          onClick={() => {
            uiSounds.playHoverTick();
            onEnterMuseum();
          }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255, 105, 180, 0.8)" }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart size={24} className="key-icon" fill="#fff" />
          <span>Enter 3D World</span>
        </motion.button>
      </div>

      {/* The massive double doors that split open */}
      <div className="massive-doors-container">
        <div className="massive-door left-door">
          <div className="door-seam-glow" />
          <div className="door-handle left-handle" />
        </div>
        <div className="massive-door right-door">
          <div className="door-handle right-handle" />
        </div>
      </div>

    </section>
  );
};

export default MuseumGateSection;
