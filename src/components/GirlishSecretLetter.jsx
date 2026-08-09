import React, { useRef, useEffect } from 'react';
import './GirlishSecretLetter.css';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import FloatingHearts3D from './FloatingHearts3D';

const GirlishSecretLetter = ({ onClose }) => {
  const cardRef = useRef(null);
  
  // Parallax
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { damping: 25, stiffness: 150 });
  const smoothY = useSpring(y, { damping: 25, stiffness: 150 });
  const rotateX = useTransform(smoothY, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], ["-5deg", "5deg"]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) / rect.width);
      y.set((e.clientY - centerY) / rect.height);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  // Framer Motion Variants for Staggered Reveal
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8, filter: "blur(20px)" },
    visible: { 
      opacity: 1, 
      scale: 1, 
      filter: "blur(0px)",
      transition: { 
        duration: 1.2, 
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: 0.2, // Stagger text lines
        delayChildren: 0.5
      }
    },
    exit: { opacity: 0, scale: 0.9, filter: "blur(20px)", transition: { duration: 0.8 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: "easeOut" } }
  };

  return (
    <motion.div 
      className="girlish-secret-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ perspective: 1500 }}
    >
      <FloatingHearts3D />

      <motion.div 
        ref={cardRef}
        className="blooming-glass-card"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      >
        <motion.div variants={itemVariants} className="blooming-ribbon" />

        <motion.h3 variants={itemVariants} className="serif secret-title glowing-text">
          My Dearest,
        </motion.h3>
        
        <div className="secret-content">
          <motion.p variants={itemVariants} className="serif">
            If you're reading this, it means you found the hidden magic.
          </motion.p>
          <motion.p variants={itemVariants} className="serif">
            There’s something I've always wanted you to know: behind every line of code, every pixel, and every carefully placed word on this page is an immense admiration for you; not just for who you are, but for everything you've endured to become the person you are today.
          </motion.p>
          <motion.p variants={itemVariants} className="serif">
            Life has not always been kind to you. You've faced hardships that would have broken many people, carried burdens you never deserved, and walked through storms that seemed endless. Yet somehow, through it all, you've remained compassionate, thoughtful, and strong. That strength isn't loud or boastful; it's the quiet kind that keeps going when no one is watching. It's one of the many things I admire most about you.
          </motion.p>
          
          <motion.div variants={itemVariants} className="highlighted-quote-box">
            <p className="serif">
              You inspire me more than you probably realize. Your courage in the face of pain, your resilience after disappointment, and your ability to keep moving forward despite everything are nothing short of remarkable. Every challenge you've survived has only made your light shine brighter.
            </p>
          </motion.div>

          <motion.p variants={itemVariants} className="serif">
            You are the spark that makes ordinary moments feel special. The world is a better place because you're in it, and the people lucky enough to know you are better for knowing you.
          </motion.p>
          <motion.p variants={itemVariants} className="serif">
            So whenever you doubt yourself, remember this: I see your strength. I see your heart. I see how far you've come. And I admire you more than words can fully express.
          </motion.p>
          <motion.p variants={itemVariants} className="serif final-thought">
            Never lose your light. It has carried you through so much already, and it continues to brighten the lives of those around you; mine included. 💖
          </motion.p>
        </div>
        
        <motion.div variants={itemVariants} className="secret-signature">
          <p className="serif signature-prefix">Always admiring you,</p>
          <p className="serif signature-name">The Architect</p>
        </motion.div>

        <motion.button 
          variants={itemVariants} 
          className="close-secret-btn" 
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Fold Note
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default GirlishSecretLetter;
