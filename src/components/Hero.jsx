import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './Hero.css';

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);

  return (
    <section className="hero-section">
      {/* Decorative Background Elements */}
      <motion.div 
        style={{ y: y1 }} 
        className="hero-bg-image img-left"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2, delay: 0.5 }}
      >
        <img src="/assets/bunny.png" alt="Bunny" />
      </motion.div>
      <motion.div 
        style={{ y: y2 }} 
        className="hero-bg-image img-right"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 2, delay: 0.7 }}
      >
        <img src="/assets/heart.png" alt="Heart" />
      </motion.div>

      <motion.div 
        className="hero-content glass-panel"
        initial={{ opacity: 0, y: 30, filter: "blur(5px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
      >
        <p className="hero-supertitle sans">
          An Ode To
        </p>
        
        <h1 className="hero-title serif">
          Bareera.
        </h1>

        <motion.div 
          className="hero-divider"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1, delay: 1 }}
        />
        
        <p className="hero-subtitle serif">
          An ephemeral sanctuary crafted solely to reflect your luminosity.
        </p>
        <p className="hero-subtitle serif">
          A digital space unbound by ordinary constraints.
        </p>
      </motion.div>
    </section>
  );
};

export default Hero;
