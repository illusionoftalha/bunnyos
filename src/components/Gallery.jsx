import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { uiSounds } from '../utils/UISounds';
import './Gallery.css';

const newImages = [
  { src: 'https://images.unsplash.com/photo-1582794543462-0d7922e50cf5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', alt: 'A bloom of soft grace.' },
  { src: 'https://plus.unsplash.com/premium_photo-1683309555671-7efeac6caa3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', alt: 'Stories yet unwritten.' },
  { src: 'https://plus.unsplash.com/premium_photo-1723622412015-c4a9b4ef46b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080', alt: 'The essence of elegance.' },
  { src: 'https://plus.unsplash.com/premium_photo-1661589327449-267c101f0291?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8cGluayUyMHJpYmJvbnxlbnwwfHx8fDE3ODE3NDc1OTB8MA&ixlib=rb-4.1.0&q=80&w=1080', alt: 'A delicate touch.' },
  { src: 'https://plus.unsplash.com/premium_photo-1681276169450-4504a2442173?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8cGVhcmwlMjBqZXdlbHJ5fGVufDB8fHx8MTc4MTc0NzU5MHww&ixlib=rb-4.1.0&q=80&w=1080', alt: 'Timeless radiance.' },
  { src: 'https://plus.unsplash.com/premium_photo-1667113144491-eaccf04e894b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMjA3fDB8MXxzZWFyY2h8MXx8cGFzdGVsJTIwY2xvdWRzfGVufDB8fHx8MTc4MTc0NzU4OXww&ixlib=rb-4.1.0&q=80&w=1080', alt: 'A sky painted for you.' },
];

const MasonryCanvas = ({ img, index, id }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, index % 2 === 0 ? -100 : 50]);

  return (
    <motion.div
      id={id}
      style={{ y }}
      className={`masonry-item item-${index}`}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.5, delay: index * 0.2, ease: "easeOut" }}
      onMouseEnter={() => uiSounds.playHoverTick()}
    >
      <div className="masonry-frame ripple-container">
        <motion.img 
          src={img.src} 
          alt={img.alt} 
          className="masonry-image"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        {/* Invisible SVG filter for hover distortion */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }}>
          <filter id={`ripple-${index}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G">
               <animate attributeName="scale" values="0;40;0" dur="1s" begin={`card-${index}.mouseenter`} fill="remove" />
            </feDisplacementMap>
          </filter>
        </svg>
        <p className="masonry-caption serif">{img.alt}</p>
      </div>
    </motion.div>
  );
};

const Gallery = () => {
  return (
    <section className="editorial-masonry">
      <div className="masonry-grid">
        {newImages.map((img, index) => (
          <MasonryCanvas key={index} img={img} index={index} id={`card-${index}`} />
        ))}
      </div>
    </section>
  );
};

export default Gallery;
