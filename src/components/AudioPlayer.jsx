import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { uiSounds } from '../utils/UISounds';
import './AudioPlayer.css';

const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  // We'll use a placeholder audio URL for now. 
  // A soft royalty free lofi or piano track works best.
  const audioUrl = "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3"; 

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      uiSounds.connectMediaElement(audioRef.current);
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <motion.div 
      className="audio-player-container glass"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 1 }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.2}
      whileHover={{ scale: 1.05 }}
    >
      <audio ref={audioRef} src={audioUrl} loop />
      
      <div className="audio-controls">
        <button onClick={togglePlay} className="control-btn hover-target">
          {isPlaying ? <Pause size={16} fill="var(--color-deep-pink)" color="var(--color-deep-pink)" /> : <Play size={16} fill="var(--color-deep-pink)" color="var(--color-deep-pink)" />}
        </button>
        
        <div className="audio-info">
          <Music size={14} color="#666" />
          <span className="scrolling-text">Soft Lofi Vibes</span>
        </div>

        <button onClick={toggleMute} className="control-btn hover-target">
          {isMuted ? <VolumeX size={16} color="#666" /> : <Volume2 size={16} color="#666" />}
        </button>
      </div>
    </motion.div>
  );
};

export default AudioPlayer;
