import React from 'react';
import { motion } from 'framer-motion';
import './StickyNotes.css';
import MagneticElement from './MagneticElement';

const notes = [
  { text: "You are truly amazing! 🌸", color: "#FFE5EC", rotation: -4, x: -50, y: 0 },
  { text: "Keep shining bright ✨", color: "#FFACD8", rotation: 6, x: 20, y: 40 },
  { text: "Don't forget to smile today! 😊", color: "#FF3AAE", rotation: -2, x: 80, y: -20, textColor: "white" },
];

const StickyNotes = () => {
  return (
    <section className="sticky-section">
      <div className="sticky-container">
        {notes.map((note, index) => (
          <MagneticElement key={index} strength={30}>
            <motion.div
              className="sticky-note hover-target"
              style={{
                backgroundColor: note.color,
                color: note.textColor || 'var(--color-deep-pink)',
              }}
              initial={{ opacity: 0, scale: 0.8, rotate: 0, x: 0, y: 0 }}
              whileInView={{ 
                opacity: 1, 
                scale: 1, 
                rotate: note.rotation, 
                x: note.x, 
                y: note.y 
              }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", bounce: 0.5, duration: 1, delay: index * 0.2 }}
              whileHover={{ scale: 1.1, zIndex: 10, rotate: 0 }}
            >
              <div className="sticky-pin" />
              <p className="sticky-text">{note.text}</p>
            </motion.div>
          </MagneticElement>
        ))}
      </div>
    </section>
  );
};

export default StickyNotes;
