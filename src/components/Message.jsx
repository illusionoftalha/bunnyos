import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import './Message.css';

const Message = () => {
  return (
    <section className="message-section">
      <motion.div
        className="message-card glass hover-target"
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, type: "spring", bounce: 0.4 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="message-glow-bg" />
        
        <motion.div 
          className="message-icon-wrapper"
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <Sparkles color="var(--color-persian-rose)" size={32} />
        </motion.div>
        
        <h2 className="message-heading">Just for you ✨</h2>
        <p className="message-text">
          I wanted to make a little space on the internet that's as sweet and wonderful as you are. 
          Keep being amazing! 🌸
        </p>
      </motion.div>
    </section>
  );
};

export default Message;
