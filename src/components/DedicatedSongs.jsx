import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import './DedicatedSongs.css';

const songs = [
  {
    title: 'Salvatore',
    artist: 'Lana Del Rey',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/a2/e1/35/a2e1350a-c739-dc75-93f5-b3e8b33d7d7e/15UMGIM44419.rgb.jpg/600x600bb.jpg',
    lyrics: '"Ah-ah-ah-ah, ah-ah-ah-ah... Cacciatore."',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/35/3d/fe/353dfe8c-c802-1880-19c0-2ec3de51617c/mzaf_2423868082573466930.plus.aac.p.m4a',
    startTime: 0,
    themeColor: 'rgba(164, 195, 210, 0.4)', // Icy blue
    ambientSolid: 'rgba(164, 195, 210, 0.15)'
  },
  {
    title: 'Yellow',
    artist: 'Coldplay',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/f5/93/8c/f5938c49-964c-31d1-4b33-78b634f71fb7/190295978075.jpg/600x600bb.jpg',
    lyrics: '"Look at the stars, look how they shine for you."',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/66/f3/1a/66f31a76-a6ed-cb4c-f353-23310a7ae9a8/mzaf_10593596652344378873.plus.aac.p.m4a',
    startTime: 5,
    themeColor: 'rgba(255, 204, 0, 0.4)', // Starry yellow
    ambientSolid: 'rgba(255, 204, 0, 0.1)'
  },
  {
    title: 'Golden Hour',
    artist: 'JVKE',
    cover: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/8d/1a/7b/8d1a7b44-316f-7c7f-4380-935673fb697a/5056167175650.jpg/600x600bb.jpg',
    lyrics: '"You slow down time... in your golden hour."',
    previewUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/30/02/8c/30028c8a-a125-5466-bcc6-27a83b1c0135/mzaf_16911571635366913039.plus.aac.p.m4a',
    startTime: 10,
    themeColor: 'rgba(255, 126, 85, 0.4)', // Sunset orange
    ambientSolid: 'rgba(255, 126, 85, 0.15)'
  }
];

const DedicatedSongs = () => {
  const audioRefs = useRef([]);
  const [likes, setLikes] = useState({});

  const handleMouseEnter = (index) => {
    if (audioRefs.current[index]) {
      audioRefs.current[index].volume = 0.5;
      audioRefs.current[index].currentTime = songs[index].startTime || 0;
      audioRefs.current[index].play().catch(e => console.log('Audio play failed', e));
    }
    // Duck main background music volume
    const mainAudio = document.querySelector('.audio-player-container audio');
    if (mainAudio) mainAudio.volume = 0.1;

    // Set ambient colors
    document.documentElement.style.setProperty('--ambient-color', songs[index].themeColor);
    document.documentElement.style.setProperty('--ambient-solid', songs[index].ambientSolid);
  };

  const handleMouseLeave = (index) => {
    if (audioRefs.current[index]) {
      audioRefs.current[index].pause();
    }
    // Restore main background music volume
    const mainAudio = document.querySelector('.audio-player-container audio');
    if (mainAudio) mainAudio.volume = 1.0;

    // Reset ambient colors
    document.documentElement.style.removeProperty('--ambient-color');
    document.documentElement.style.removeProperty('--ambient-solid');
  };



  const handleDrag = (event, info, index) => {
    if (audioRefs.current[index]) {
      const audio = audioRefs.current[index];
      const newTime = audio.currentTime + (info.delta.x * 0.05);
      if (!isNaN(newTime)) {
        audio.currentTime = Math.max(0, Math.min(audio.duration || 30, newTime));
      }
    }
  };

  const handleLike = (e, index) => {
    e.stopPropagation(); // prevent triggering other card events
    const isLiked = likes[index];
    setLikes(prev => ({ ...prev, [index]: !isLiked }));
    
    if (!isLiked) {
      // Get button coordinates for confetti origin
      const rect = e.target.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: ['#ff4d4d', '#ffb3c6', '#ffffff'],
        disableForReducedMotion: true
      });
    }
  };

  return (
    <section className="dedicated-songs-section">
      <motion.div
        className="songs-header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
      >
        <h2 className="serif">Melodies of You</h2>
        <p className="songs-subtitle serif">Songs that sound exactly like the way you make the world feel.</p>
      </motion.div>

      <div className="songs-container">
        {songs.map((song, index) => (
          <motion.div
            key={index}
            className="song-card glass"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: index * 0.3 }}
            whileHover={{ y: -10 }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
          >
            <button 
              className={`favorite-btn ${likes[index] ? 'liked' : ''}`}
              onClick={(e) => handleLike(e, index)}
            >
              {likes[index] ? '❤️' : '🤍'}
            </button>

            <audio
              ref={el => audioRefs.current[index] = el}
              src={song.previewUrl}
              preload="metadata"
              loop
            />
            <div className="vinyl-wrapper">
              <motion.div 
                className="vinyl-record"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDrag={(event, info) => handleDrag(event, info, index)}
                whileDrag={{ cursor: 'grabbing', scale: 1.05 }}
              >
                <div className="vinyl-center" />
              </motion.div>
              <div className="tonearm">
                <div className="tonearm-base" />
                <div className="tonearm-arm" />
                <div className="tonearm-needle" />
              </div>
              <img src={song.cover} alt={song.title} className="song-cover" />
            </div>
            <div className="song-info">
              <div className="song-title-row">
                <h3 className="song-title serif">{song.title}</h3>
                <div className="soundwave">
                  <span/><span/><span/>
                </div>
              </div>
              <p className="song-artist">{song.artist}</p>
              <p className="song-lyrics serif"><i>{song.lyrics}</i></p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default DedicatedSongs;
