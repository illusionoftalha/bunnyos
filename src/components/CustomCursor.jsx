import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import './CustomCursor.css';

const CustomCursor = () => {
  const [cursorState, setCursorState] = useState('default'); // 'default', 'hover', 'view'

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  // Spring configuration for the outer ring to trail slightly
  const springConfig = { damping: 25, stiffness: 150 };
  const cursorXSpring = useSpring(mouseX, springConfig);
  const cursorYSpring = useSpring(mouseY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (target.closest('.bunnyos-overlay')) {
        setCursorState('hidden');
      } else if (target.closest('.canvas-image-container')) {
        setCursorState('view');
      } else if (target.tagName.toLowerCase() === 'a' || target.tagName.toLowerCase() === 'button' || target.closest('.hover-target')) {
        setCursorState('hover');
      } else {
        setCursorState('default');
      }
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  const dotVariants = {
    default: {
      scale: 1,
      opacity: 1,
    },
    hover: {
      scale: 1.3,
      opacity: 1,
      backgroundColor: '#ff1493'
    },
    view: {
      scale: 0.8,
      opacity: 1,
    },
    hidden: {
      scale: 0,
      opacity: 0,
    }
  };

  const ringVariants = {
    default: {
      scale: 1,
      backgroundColor: 'rgba(255, 255, 255, 0)',
      border: '1px solid var(--color-persian-pink)',
    },
    hover: {
      scale: 1.5,
      backgroundColor: 'rgba(255, 115, 195, 0.2)',
      border: '1px solid var(--color-deep-pink)',
    },
    view: {
      scale: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      mixBlendMode: 'normal'
    },
    hidden: {
      scale: 0,
      opacity: 0,
    }
  };

  return (
    <>
      <motion.div
        className="custom-cursor-dot"
        variants={dotVariants}
        animate={cursorState}
        transition={{ type: "tween", ease: "backOut", duration: 0.15 }}
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%'
        }}
      />
      <motion.div
        className="custom-cursor-ring"
        variants={ringVariants}
        animate={cursorState}
        transition={{ type: "tween", ease: "easeOut", duration: 0.3 }}
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%'
        }}
      >
        <AnimatePresence>
          {cursorState === 'view' && (
            <motion.span 
              className="cursor-text"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              VIEW
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default CustomCursor;
