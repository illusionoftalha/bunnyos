import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Play, Pause } from 'lucide-react';
import ReactPlayer from 'react-player';
import './GlitchTerminal.css';
import { uiSounds } from '../utils/UISounds';

const classifiedFiles = [
  { name: 'bhondu_and_bhondu_maharani.jpg', src: '/bhondu_and_bhondu_maharani.jpg' },
  { name: 'girly_poppies.jpg', src: '/girly_poppies.jpg' },
  { name: 'the_bhondu_group.jpg', src: '/the_bhondu_group.jpg' },
  { name: 'the_og_group.jpg', src: '/the_og_group.jpg' },
  { name: 'three_intellectuals.jpg', src: '/three_intellectuals.jpg' },
  { name: 'us.jpg', src: '/us.jpg' }
];

const CustomAudioPlayer = ({ src }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100 || 0);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '250px', paddingLeft: '5px' }}>
      <audio
        ref={audioRef}
        src={src}
        autoPlay
        loop
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      <button
        onClick={togglePlay}
        style={{
          background: 'none',
          border: '1px solid #0f0',
          color: '#0f0',
          cursor: 'pointer',
          width: '32px',
          height: '32px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: '50%',
          outline: 'none',
          padding: 0
        }}
      >
        {isPlaying ? <Pause size={14} fill="#0f0" /> : <Play size={14} fill="#0f0" style={{ marginLeft: '2px' }} />}
      </button>
      <div style={{ flex: 1, height: '4px', background: 'rgba(0, 255, 0, 0.2)', position: 'relative', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: '#0f0', width: `${progress}%`, transition: 'width 0.1s linear' }}></div>
      </div>
    </div>
  );
};

const MatrixRain = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=<>?'.split('');
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = letters[Math.floor(Math.random() * letters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, zIndex: 0, pointerEvents: 'none', opacity: 0.15 }} />;
};

const MEMORIES = [
  // "ARCHIVE LOG #001: You have this incredible ability to make everyone around you feel heard and valued.",
  // "ARCHIVE LOG #002: Your kindness is honestly your superpower. Never lose that.",
  // "ARCHIVE LOG #003: I don't think you realize how much light you bring into a room just by being in it.",
  // "ARCHIVE LOG #004: The way your brain works is so unique—listening to your weird, random thoughts is always the best.",
  // "ARCHIVE LOG #005: You are one of the most genuinely precious people on this planet. Protect your peace at all costs.",
  // "ARCHIVE LOG #006: Even on your messy days, you're doing amazing. Don't be too hard on yourself.",
  // "ARCHIVE LOG #007: You have this infectious energy. It's impossible to be in a bad mood when you're around.",
  // "ARCHIVE LOG #008: I admire how fiercely you care about the things and people you love.",
  // "ARCHIVE LOG #009: You're doing so much better than you give yourself credit for. Keep going, Bhondu.",
  // "ARCHIVE LOG #010: You have a heart of gold. Don't let the world change that.",
  // "ARCHIVE LOG #011: The world is a genuinely better place because you're in it.",
  // "ARCHIVE LOG #012: You always know how to make people feel safe and comfortable.",
  // "ARCHIVE LOG #013: Your laugh is incredibly contagious.",
  // "ARCHIVE LOG #014: I am so incredibly proud of the person you are.",
  // "ARCHIVE LOG #015: You handle everything life throws at you with such grace.",
  // "ARCHIVE LOG #016: You have the rare gift of making ordinary moments feel special.",
  // "ARCHIVE LOG #017: There is so much warmth in your soul.",
  // "ARCHIVE LOG #018: You are enough, exactly as you are right now.",
  // "ARCHIVE LOG #019: Your resilience is truly inspiring.",
  // "ARCHIVE LOG #020: The way you support your friends is something everyone admires.",
  // "ARCHIVE LOG #021: You're always trying to grow and be better, and it shows.",
  // "ARCHIVE LOG #022: I hope you see yourself the way others see you—radiant and brilliant.",
  // "ARCHIVE LOG #023: You're allowed to take up space. Never shrink yourself for anyone.",
  // "ARCHIVE LOG #024: You have an incredibly beautiful mind.",
  // "ARCHIVE LOG #025: Your perspective on life is so refreshing.",
  // "ARCHIVE LOG #026: You bring so much comfort to the people around you.",
  // "ARCHIVE LOG #027: You are a masterpiece in progress.",
  // "ARCHIVE LOG #028: The empathy you show others is a rare and beautiful thing.",
  // "ARCHIVE LOG #029: Your presence is like a breath of fresh air.",
  // "ARCHIVE LOG #030: You have this effortless charm that just draws people in.",
  // "ARCHIVE LOG #031: I love how passionate you get about the things you care about.",
  // "ARCHIVE LOG #032: You are incredibly brave, even when you don't feel like it.",
  // "ARCHIVE LOG #033: You deserve all the good things that come your way.",
  // "ARCHIVE LOG #034: You are so much stronger than you think.",
  // "ARCHIVE LOG #035: Never apologize for being exactly who you are.",
  // "ARCHIVE LOG #036: You have a way of making people feel truly seen.",
  // "ARCHIVE LOG #037: The effort you put into everything you do does not go unnoticed.",
  // "ARCHIVE LOG #038: You are an absolute joy to be around.",
  // "ARCHIVE LOG #039: Your creativity is limitless.",
  // "ARCHIVE LOG #040: It's okay to take a break. You've earned it.",
  // "ARCHIVE LOG #041: You have the kind of smile that brightens up the whole day.",
  // "ARCHIVE LOG #042: You bring so much positivity into the world.",
  // "ARCHIVE LOG #043: You are constantly evolving into an even better version of yourself.",
  // "ARCHIVE LOG #044: The way you look out for others is so heartwarming.",
  // "ARCHIVE LOG #045: You are truly one of a kind.",
  // "ARCHIVE LOG #046: Your authenticity is your greatest asset.",
  // "ARCHIVE LOG #047: You have such a gentle and caring soul.",
  // "ARCHIVE LOG #048: The world needs more people exactly like you.",
  // "ARCHIVE LOG #049: You always manage to find the good in every situation.",
  // "ARCHIVE LOG #050: Your determination is something to be admired.",
  // "ARCHIVE LOG #051: You have a wonderfully quirky sense of humor.",
  // "ARCHIVE LOG #052: I hope you know how much you are appreciated.",
  // "ARCHIVE LOG #053: You are the definition of a true friend.",
  // "ARCHIVE LOG #054: You radiate such a peaceful energy.",
  // "ARCHIVE LOG #055: Your ability to overcome challenges is incredible.",
  // "ARCHIVE LOG #056: You are beautifully complex and absolutely fascinating.",
  // "ARCHIVE LOG #057: You always know exactly what to say to make things better.",
  // "ARCHIVE LOG #058: You have such a big heart, and it shows in everything you do.",
  // "ARCHIVE LOG #059: You are so incredibly thoughtful.",
  // "ARCHIVE LOG #060: Your potential is limitless.",
  // "ARCHIVE LOG #061: You make the world a softer place.",
  // "ARCHIVE LOG #062: You are deeply cherished by the people in your life.",
  // "ARCHIVE LOG #063: You are so wonderfully intelligent.",
  // "ARCHIVE LOG #064: Your ideas are valid and important.",
  // "ARCHIVE LOG #065: You have an incredible sense of style.",
  // "ARCHIVE LOG #066: You are so deeply caring, it's inspiring.",
  // "ARCHIVE LOG #067: You bring out the best in everyone you meet.",
  // "ARCHIVE LOG #068: Your courage is quiet but so incredibly strong.",
  // "ARCHIVE LOG #069: You are so deserving of love and happiness.",
  // "ARCHIVE LOG #070: You are a constant source of inspiration.",
  // "ARCHIVE LOG #071: Your dreams are important and achievable.",
  // "ARCHIVE LOG #072: You always leave things better than you found them.",
  // "ARCHIVE LOG #073: You are remarkably intuitive and emotionally intelligent.",
  // "ARCHIVE LOG #074: You are doing a great job, even when it feels hard.",
  // "ARCHIVE LOG #075: You have an inner beauty that shines outward.",
  // "ARCHIVE LOG #076: You are a wonderful listener.",
  // "ARCHIVE LOG #077: You are so full of wonderful surprises.",
  // "ARCHIVE LOG #078: Your ability to forgive and move forward is powerful.",
  // "ARCHIVE LOG #079: You are deeply treasured, just for being you.",
  // "ARCHIVE LOG #080: You make the mundane things feel magical.",
  // "ARCHIVE LOG #081: You are incredibly observant and detail-oriented.",
  // "ARCHIVE LOG #082: Your honesty is so refreshing.",
  // "ARCHIVE LOG #083: You are a safe space for the people you care about.",
  // "ARCHIVE LOG #084: You have an extraordinary way of looking at the world.",
  // "ARCHIVE LOG #085: You are deeply and truly valued.",
  // "ARCHIVE LOG #086: You always bring such a wonderful perspective to things.",
  // "ARCHIVE LOG #087: You are allowed to rest without feeling guilty.",
  // "ARCHIVE LOG #088: You are so much more than your productivity.",
  // "ARCHIVE LOG #089: Your gentle nature is a rare gift.",
  // "ARCHIVE LOG #090: You have such a vibrant and beautiful spirit.",
  "ARCHIVE LOG #091: You are the absolute best version of yourself.",
  "ARCHIVE LOG #092: You make every day a little bit brighter.",
  "ARCHIVE LOG #093: You are a true gem of a human being.",
  "ARCHIVE LOG #094: Your individuality is what makes you so special.",
  "ARCHIVE LOG #095: You have a truly remarkable capacity for love.",
  "ARCHIVE LOG #096: You are wonderfully unapologetic about who you are.",
  "ARCHIVE LOG #097: You are incredibly insightful and wise.",
  "ARCHIVE LOG #098: Your spirit is truly unbreakable.",
  "ARCHIVE LOG #099: You are entirely irreplaceable.",
  "ARCHIVE LOG #100: Never forget how incredibly precious you are to the world."
];

const GlitchTerminal = ({ onEnterMuseum }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('idle'); // idle, prompt, input, denied, granted, gallery
  const [displayedText, setDisplayedText] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [galleryInputValue, setGalleryInputValue] = useState('');
  const [popupInputValue, setPopupInputValue] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [viewingImageIndex, setViewingImageIndex] = useState(null);
  const [galleryError, setGalleryError] = useState('');
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [playingSong, setPlayingSong] = useState(null);
  const [waitingForSong, setWaitingForSong] = useState(false);
  const [waitingForVaultPass, setWaitingForVaultPass] = useState(false);
  const [isVirusActive, setIsVirusActive] = useState(false);
  const [virusPopups, setVirusPopups] = useState(0);
  const [matrixMode, setMatrixMode] = useState(false);
  const [showFiles, setShowFiles] = useState(true);
  const inputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const popupInputRef = useRef(null);
  const contentRef = useRef(null);

  // Auto-scroll to bottom of terminal content
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [terminalOutput, phase, displayedText]);

  // Hide the main website scrollbar while the terminal is active
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isActive]);

  const promptText = "system_failure_detected...\ninitiating_manual_override...\n\nplease enter your name to continue:";
  const deniedText = "access denied. intruder detected. terminating session...";
  const grantedText = "unauthorized access detected...\noh wait, it's just you, bhondu maharani\n\ndecrypting_vault...";

  // Typing effect helper
  const typeText = async (text, speed = 40) => {
    setDisplayedText('');
    for (let i = 0; i <= text.length; i++) {
      setDisplayedText(text.substring(0, i));
      if (text[i] && text[i] !== ' ' && text[i] !== '\n') {
        uiSounds.playHoverTick(); // using existing sound as a typing tick
      }
      await new Promise(resolve => setTimeout(resolve, speed));
    }
  };

  useEffect(() => {
    if (isActive && phase === 'idle') {
      const runPrompt = async () => {
        setPhase('prompt');
        await new Promise(resolve => setTimeout(resolve, 500)); // Initial pause
        await typeText(promptText, 30);
        setPhase('input');
      };
      runPrompt();
    }
  }, [isActive, phase]);

  useEffect(() => {
    if (phase === 'input' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase]);

  useEffect(() => {
    if (viewingImageIndex !== null && popupInputRef.current) {
      popupInputRef.current.focus();
    } else if (viewingImageIndex === null && galleryInputRef.current && phase === 'gallery') {
      galleryInputRef.current.focus();
    }
  }, [viewingImageIndex, phase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rawVal = inputValue.trim().toLowerCase();
    if (!rawVal) return;

    const isBareera = rawVal === 'bareera';
    setPhase('processing');

    if (isBareera) {
      await typeText(grantedText, 40);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPhase('gallery');
    } else {
      await typeText(deniedText, 30);
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Reset terminal after denial
      setIsActive(false);
      setPhase('idle');
      setInputValue('');
      setDisplayedText('');
    }
  };

  // Lock body scroll when GlitchTerminal is active
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isActive]);

  const handleOpen = () => {
    setIsActive(true);
    setPhase('idle');
    setInputValue('');
    setDisplayedText('');
    setViewingImageIndex(null);
    setGalleryInputValue('');
    setPopupInputValue('');
    setIsLoggingOut(false);
    setGalleryError('');
    uiSounds.playCinematicWhoosh();
  };

  const handleClose = () => {
    setIsActive(false);
    setPhase('idle');
    setInputValue('');
    setDisplayedText('');
    setViewingImageIndex(null);
    setGalleryInputValue('');
    setPopupInputValue('');
    setIsLoggingOut(false);
    setGalleryError('');
  };

  const handlePopupSubmit = (e) => {
    e.preventDefault();
    if (popupInputValue.trim().toLowerCase() === 'back') {
      setViewingImageIndex(null);
      setPopupInputValue('');
    } else {
      setPopupInputValue('');
    }
  };

  const handleOverlayClick = () => {
    if (viewingImageIndex !== null && popupInputRef.current) {
      popupInputRef.current.focus();
    } else if (phase === 'gallery' && galleryInputRef.current) {
      galleryInputRef.current.focus();
    } else if (phase === 'input' && inputRef.current) {
      inputRef.current.focus();
    }
  };

  const addOutput = (text, isCommand = false) => {
    setTerminalOutput(prev => [...prev, { text, isCommand }]);
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    const cmd = galleryInputValue.trim().toLowerCase();
    if (!cmd) return;

    addOutput(`> ${cmd}`, true);
    setGalleryInputValue('');
    setGalleryError('');

    if (waitingForSong) {
      const s = cmd.toLowerCase();
      if (s === 'abort' || s === 'cancel') {
        addOutput('music selection cancelled.');
      } else if (s.includes('barse') || s.includes('naina')) {
        addOutput('playing: Barse/Naina by Rumii & Chayan... \n(type "stop music" to halt)');
        setPlayingSong({ title: 'Barse / Naina - Rumii & Chayan', src: '/barse naina.mp3' });
      } else if (s.includes('golden') || s.includes('hour') || s.includes('jvke')) {
        addOutput('playing: Golden Hour by JVKE... \n(type "stop music" to halt)');
        setPlayingSong({ title: 'Golden Hour - JVKE', src: '/golden hour.mp3' });
      } else if (s.includes('salvatore') || s.includes('lana')) {
        addOutput('playing: Salvatore by Lana Del Rey... \n(type "stop music" to halt)');
        setPlayingSong({ title: 'Salvatore - Lana Del Rey', src: '/salvatore.mp3' });
      } else if (s.includes('yellow') || s.includes('coldplay')) {
        addOutput('playing: Yellow by Coldplay... \n(type "stop music" to halt)');
        setPlayingSong({ title: 'Yellow - Coldplay', src: '/yellow.mp3' });
      } else {
        addOutput(`song not found: "${cmd}". \nAvailable: barse naina, golden hour, salvatore, yellow.`);
      }
      setWaitingForSong(false);
      return;
    }

    if (waitingForVaultPass) {
      if (cmd === 'bhondu') {
        addOutput('PASSCODE ACCEPTED.');
        addOutput('Decrypting top-secret vault...');
        setTimeout(() => {
          addOutput('\n======================================================');
          addOutput('TOP SECRET DOSSIER: BUNNY (LEVEL 10 CLEARANCE)');
          addOutput('======================================================');
          addOutput('Target is highly chaotic but exceptionally capable.');
          addOutput('Known attributes: Brilliant, unpredictable, totally one-of-a-kind.');
          addOutput('Status: The ONLY user permitted to access the mainframe.');
          addOutput('Note: We built this entire OS just to keep her entertained.');
          addOutput('======================================================\n');
        }, 800);
        setWaitingForVaultPass(false);
      } else if (cmd === 'abort' || cmd === 'cancel') {
        addOutput('vault decryption cancelled.');
        setWaitingForVaultPass(false);
      } else {
        addOutput('ACCESS DENIED. INCORRECT PASSCODE. (hint: what do I call you?)');
        addOutput('ENTER PASSCODE (or type "abort" to cancel):');
      }
      return;
    }

    const normCmd = cmd.replace(/[^a-z0-9]/g, '');

    if (cmd === 'abort' || cmd === 'exit' || cmd === 'logout') {
      setIsLoggingOut(true);
      await typeText("bubyee, my bunny...", 50);
      await new Promise(resolve => setTimeout(resolve, 2000));
      handleClose();
    } else if (cmd === 'help') {
      addOutput('[SYSTEM] available commands: open bunnyos, ls, cd <file>, cd vault, locate bunny, memory, matrix, virus, cat <file>, whoami, date, uptime, clear, hack, play music, stop music, abort');
    } else if (
      normCmd === 'bunnyos' ||
      normCmd === 'openbunnyos' ||
      normCmd === 'startbunnyos' ||
      normCmd === 'runbunnyos' ||
      normCmd === 'bunnyos98' ||
      normCmd === 'openbunnyos98' ||
      normCmd === 'bunny' ||
      normCmd === 'openbunny'
    ) {
      addOutput('LAUNCHING BUNNYOS 98 MAINFRAME SERVER...');
      uiSounds.playCinematicWhoosh();
      setTimeout(() => {
        if (typeof window.openBunnyOS === 'function') {
          window.openBunnyOS();
        } else {
          window.dispatchEvent(new CustomEvent('open-bunnyos'));
        }
        setTimeout(() => {
          handleClose();
        }, 300);
      }, 400);
    } else if (cmd === 'memory') {
      addOutput('SEARCHING ARCHIVES...');
      setTimeout(() => {
        const randomMemory = MEMORIES[Math.floor(Math.random() * MEMORIES.length)];
        addOutput('>> SECURE MEMORY RETRIEVED <<');
        addOutput(randomMemory);
      }, 600);
    } else if (cmd === 'virus' || cmd === 'deploy virus') {
      setIsVirusActive(true);
      setVirusPopups(5);
      addOutput('WARNING: UNKNOWN PAYLOAD EXECUTED.');
      addOutput('CRITICAL SYSTEM FAILURE IMMINENT.');

      const virusInterval = setInterval(() => {
        addOutput(Array.from({ length: 64 }, () => String.fromCharCode(33 + Math.floor(Math.random() * 94))).join(''));
        setVirusPopups(prev => prev + 3); // Spawns 3 more popups every 150ms!
      }, 150);

      setTimeout(() => {
        clearInterval(virusInterval);
        setIsVirusActive(false);
        setVirusPopups(0);
        addOutput('\n======================================');
        addOutput('Virus neutralized. BunnyOS is impenetrable.');
        addOutput('======================================\n');
      }, 8000);
    } else if (cmd === 'cd vault') {
      addOutput('RESTRICTED AREA. ENTER PASSCODE:');
      setWaitingForVaultPass(true);
    } else if (cmd === 'locate bunny') {
      addOutput('INITIATING GLOBAL SATELLITE SCAN...');
      setTimeout(() => addOutput('Connecting to orbital network [OK]'), 1500);
      setTimeout(() => addOutput('Synchronizing deep-space telemetry [OK]'), 3000);

      setTimeout(() => {
        let count = 0;
        const hexInterval = setInterval(() => {
          const randomHex = Array.from({ length: 4 }, () => Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase()).join(' ');
          const ips = `PING ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.x`;
          addOutput(`[TRAFFIC] ${ips} | ${randomHex}`);
          count++;
          if (count > 25) clearInterval(hexInterval);
        }, 80);
      }, 4000);

      setTimeout(() => addOutput('\nTriangulating biometric signature [OK]'), 6500);
      setTimeout(() => addOutput('Bypassing local firewalls (Brute-force in progress)...'), 7500);

      setTimeout(() => {
        let count = 0;
        const crackInterval = setInterval(() => {
          const pwd = Math.random().toString(36).substring(2, 10).toUpperCase();
          addOutput(`> Trying hash: ${pwd} ... [FAILED]`);
          count++;
          if (count > 15) {
            clearInterval(crackInterval);
            addOutput(`> Trying hash: 0XF9A2 ... [SUCCESS]`);
          }
        }, 120);
      }, 8500);

      setTimeout(() => addOutput('\nDecrypting payload data...'), 11000);

      setTimeout(() => {
        let pct = 0;
        const progInterval = setInterval(() => {
          pct += 10;
          const bar = '█'.repeat(pct / 10) + '░'.repeat(10 - pct / 10);
          addOutput(`[${bar}] ${pct}%`);
          if (pct >= 100) clearInterval(progInterval);
        }, 300);
      }, 12000);

      setTimeout(() => addOutput('\nLocking onto target coordinates...'), 16000);
      setTimeout(() => addOutput('Resolution enhancing...'), 17500);
      setTimeout(() => addOutput('CRITICAL ALERT: Target is radiating extreme amounts of cuteness.'), 19000);
      setTimeout(() => addOutput('\nLocation found: In my mind. (Distance: 0 meters)\n'), 21000);
    } else if (cmd === 'whoami') {
      addOutput('current_user: bunny // clearance_level: MAXIMUM // status: deeply cared');
    } else if (cmd === 'date' || cmd === 'uptime') {
      addOutput('system uptime: forever // time spent thinking about you: infinite');
    } else if (cmd === 'sysinfo' || cmd === 'neofetch') {
      addOutput(`  (\\_/)   OS: BunnyOS v1.0\n (='.'=)  Memory: 100% focused on you\n (")_(")  Uptime: forever\n          Status: deeply cared`);
    } else if (cmd === 'clear' || cmd === 'cls') {
      setTerminalOutput([]);
    } else if (cmd === 'sudo rm -rf /' || cmd === 'rm -rf /') {
      addOutput("access denied. these files are protected by our bond. nice try.");
    } else if (cmd === 'matrix') {
      if (matrixMode) {
        setMatrixMode(false);
        addOutput('Matrix mode deactivated.');
      } else {
        setMatrixMode(true);
        addOutput('Waking up... Follow the white rabbit.');
      }
    } else if (cmd === 'hack') {
      addOutput('INITIATING OVERRIDE...');
      let i = 0;
      const interval = setInterval(() => {
        setTerminalOutput(prev => [...prev, { text: Array.from({ length: 8 }, () => Math.random().toString(2).substr(2, 8)).join(' '), isCommand: false }]);
        if (i++ > 15) clearInterval(interval);
      }, 50);
    } else if (cmd === 'play music' || cmd.startsWith('play ')) {
      if (cmd !== 'play music') {
        const s = cmd.replace(/^play\s+/, '').trim().toLowerCase();
        if (s.includes('barse') || s.includes('naina')) {
          addOutput('playing: Barse/Naina by Rumii & Chayan... \n(type "stop music" to halt)');
          setPlayingSong({ title: 'Barse / Naina - Rumii & Chayan', src: '/barse naina.mp3' });
          return;
        } else if (s.includes('golden') || s.includes('hour') || s.includes('jvke')) {
          addOutput('playing: Golden Hour by JVKE... \n(type "stop music" to halt)');
          setPlayingSong({ title: 'Golden Hour - JVKE', src: '/golden hour.mp3' });
          return;
        } else if (s.includes('salvatore') || s.includes('lana')) {
          addOutput('playing: Salvatore by Lana Del Rey... \n(type "stop music" to halt)');
          setPlayingSong({ title: 'Salvatore - Lana Del Rey', src: '/salvatore.mp3' });
          return;
        } else if (s.includes('yellow') || s.includes('coldplay')) {
          addOutput('playing: Yellow by Coldplay... \n(type "stop music" to halt)');
          setPlayingSong({ title: 'Yellow - Coldplay', src: '/yellow.mp3' });
          return;
        }
      }
      addOutput('AVAILABLE MUSIC TRACKS:\n1. barse naina\n2. golden hour\n3. salvatore\n4. yellow\n\ntype the song name to play (or "abort" to cancel):');
      setWaitingForSong(true);
    } else if (cmd === 'stop music') {
      addOutput('music stopped.');
      setPlayingSong(null);
    } else if (cmd === 'back' || cmd === 'cd ..') {
      setViewingImageIndex(null);
    } else if (cmd === 'ls') {
      addOutput('classified_files:\n' + classifiedFiles.map(f => `- ${f.name}`).join('\n'));
    } else if (cmd.startsWith('cd ') || cmd.startsWith('open ') || cmd.startsWith('view ')) {
      const parts = cmd.split(' ');
      const filename = parts.slice(1).join(' ');
      const foundIndex = classifiedFiles.findIndex(f => f.name.toLowerCase() === filename);

      if (foundIndex !== -1) {
        setViewingImageIndex(foundIndex);
      } else {
        addOutput(`FILE NOT FOUND: ${filename}`);
      }
    } else if (cmd.startsWith('cat ')) {
      const parts = cmd.split(' ');
      const filename = parts.slice(1).join(' ');
      if (filename === 'secret.txt') {
        addOutput('take care of yourself. i would be devastated if something happens to you, you bhondu bunny.');
      } else {
        addOutput(`cannot read file: ${filename}. maybe try 'cat secret.txt'?`);
      }
    } else if (cmd === 'go-to museum' || cmd === 'go-to meuseum') {
      addOutput('initiating dimensional jump to 3d museum...');
      setTimeout(() => {
        if (onEnterMuseum) onEnterMuseum();
        setTimeout(() => {
          handleClose();
        }, 800);
      }, 1500);
    } else {
      addOutput(`COMMAND NOT RECOGNIZED: ${cmd}. type 'help' for available commands.`);
    }
  };

  // Secret keyboard trigger
  useEffect(() => {
    let typedBuffer = '';
    const secretCode = 'terminal';

    const handleGlobalKeyDown = (e) => {
      if (isActive) return;
      if (e.key.length !== 1) return; // ignore modifier keys

      typedBuffer += e.key.toLowerCase();
      if (typedBuffer.length > secretCode.length) {
        typedBuffer = typedBuffer.substring(typedBuffer.length - secretCode.length);
      }

      if (typedBuffer === secretCode) {
        handleOpen();
        typedBuffer = '';
      }
    };

    const handleCustomOpenEvent = () => handleOpen();

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('open-terminal', handleCustomOpenEvent);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('open-terminal', handleCustomOpenEvent);
    };
  }, [isActive]);

  // Voice command trigger
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let recognition = null;
    let isListening = false;

    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const command = event.results[last][0].transcript.trim().toLowerCase();

        // Look for the trigger phrase
        if (command.includes('open terminal') || command.includes('terminal')) {
          handleOpen();
        }
      };

      recognition.onend = () => {
        isListening = false;
        if (!isActive) {
          try {
            recognition.start();
          } catch (e) { }
        }
      };

      const tryStart = () => {
        if (!isListening && !isActive) {
          try {
            recognition.start();
            isListening = true;
          } catch (e) { }
        }
      };

      // Try starting immediately
      tryStart();

      // Browsers often block mic access until user interacts with the page
      // So we attach a global click listener to start it on their first interaction
      window.addEventListener('click', tryStart);

      return () => {
        window.removeEventListener('click', tryStart);
        if (recognition) {
          recognition.onend = null;
          try {
            recognition.stop();
          } catch (e) { }
        }
      };
    } catch (e) {
      console.error(e);
    }
  }, [isActive]);

  return (
    <>
      <AnimatePresence>
        {isActive && (
          <motion.div
            className={`glitch-terminal-overlay ${isVirusActive ? 'virus-shake' : ''}`}
            onClick={handleOverlayClick}
            initial={{ opacity: 0, scale: 1.1, filter: 'hue-rotate(90deg)' }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: 'hue-rotate(0deg)',
              transition: { duration: 0.3 }
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              transition: { duration: 0.3 }
            }}
          >
            <div className="scanline" />
            {matrixMode && <MatrixRain />}

            {isVirusActive && (
              <>
                {Array.from({ length: virusPopups }).map((_, i) => (
                  <div key={`popup-${i}`} className="virus-popup" style={{
                    top: `${Math.random() * 90}%`,
                    left: `${Math.random() * 80}%`,
                    width: `${150 + Math.random() * 300}px`,
                    height: `${100 + Math.random() * 200}px`,
                    backgroundColor: ['#ff0000', '#0000ff', '#ffff00', '#ffffff'][Math.floor(Math.random() * 4)],
                    color: ['#ffffff', '#ffff00', '#000000', '#ff0000'][Math.floor(Math.random() * 4)],
                    fontSize: `${1 + Math.random() * 2}rem`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    transform: `rotate(${Math.random() * 40 - 20}deg)`,
                    zIndex: 10000 + i
                  }}>
                    {['FATAL ERROR', 'SYSTEM CORRUPTED', 'MEMORY LEAK DETECTED', 'BREACH', 'DELETING C:\\Windows\\System32', 'TROJAN.EXE RUNNING', 'YOUR DATA IS MINE'][Math.floor(Math.random() * 7)]}
                  </div>
                ))}
              </>
            )}

            <div className="glitch-terminal-content" ref={contentRef} data-lenis-prevent>
              {phase !== 'gallery' ? (
                <>
                  <div className="glitch-text" style={{ whiteSpace: 'pre-wrap' }}>
                    {displayedText}
                    {(phase === 'prompt' || phase === 'processing') && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>_</motion.span>}
                  </div>

                  {phase === 'input' && (
                    <form onSubmit={handleSubmit} className="terminal-input-container">
                      <span className="terminal-prompt">{'>'}</span>
                      <input
                        ref={inputRef}
                        type="text"
                        className="terminal-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        autoFocus
                        spellCheck="false"
                      />
                    </form>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="terminal-gallery-container"
                  style={{ position: 'relative' }}
                >
                  <div style={{ textAlign: 'left', marginBottom: '30px' }}>
                    <pre style={{ fontSize: '1.5rem', lineHeight: '1.2', textShadow: '0 0 10px #0f0', margin: '0 0 15px 0', display: 'inline-block', fontWeight: 'bold' }}>
                      {`  (\\_/)
 (='.'=)
 (")_(")`}
                    </pre>
                    <h2 style={{ textShadow: '0 0 10px #0f0', marginBottom: '5px', letterSpacing: '2px', textTransform: 'uppercase' }}>Welcome to BunnyOS</h2>
                    <h3 style={{ textShadow: '0 0 10px #0f0', color: 'rgba(0, 255, 0, 0.7)', fontSize: '1.1rem' }}>vault_decrypted // classified_files</h3>
                  </div>

                  <div className="terminal-file-list" style={{ marginBottom: '2rem', fontSize: '1.2rem', lineHeight: '1.8' }}>

                    <div className="terminal-history" style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
                      {terminalOutput.map((item, idx) => (
                        <div key={idx} style={{
                          color: item.isCommand ? 'rgba(0, 255, 0, 0.5)' : '#0f0',
                          marginBottom: '5px'
                        }}>
                          {item.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence>
                    {viewingImageIndex !== null && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                          position: 'absolute',
                          top: 0, left: 0, width: '100%', height: '100%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          pointerEvents: 'none',
                          zIndex: 50,
                          backdropFilter: 'blur(3px)'
                        }}
                      >
                        <motion.div
                          initial={{ scale: 0.8, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          exit={{ scale: 0.8, y: 20 }}
                          style={{
                            background: 'rgba(10, 10, 10, 0.95)',
                            padding: '15px',
                            border: '1px solid #0f0',
                            boxShadow: '0 0 30px rgba(0,255,0,0.4)',
                            borderRadius: '8px',
                            pointerEvents: 'auto'
                          }}
                        >
                          <div style={{ marginBottom: '10px', color: '#0f0', display: 'flex', flexDirection: 'column', fontFamily: 'Courier New' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                              <span>{classifiedFiles[viewingImageIndex].name}</span>
                            </div>
                            <form onSubmit={handlePopupSubmit} style={{ display: 'flex', alignItems: 'center' }}>
                              <span style={{ marginRight: '10px' }}>{'>'}</span>
                              <input
                                ref={popupInputRef}
                                type="text"
                                value={popupInputValue}
                                onChange={(e) => setPopupInputValue(e.target.value)}
                                placeholder="type 'back' to close..."
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#0f0',
                                  fontFamily: 'Courier New',
                                  fontSize: '1.2rem',
                                  outline: 'none',
                                  width: '100%',
                                  textTransform: 'lowercase',
                                  cursor: 'none'
                                }}
                                spellCheck="false"
                              />
                            </form>
                          </div>
                          <div style={{ width: '400px', height: '400px', maxWidth: '80vw', maxHeight: '50vh', overflow: 'hidden', borderRadius: '4px', border: '1px solid rgba(0,255,0,0.3)' }}>
                            <img
                              src={classifiedFiles[viewingImageIndex].src}
                              alt="Classified"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isLoggingOut ? (
                    <form onSubmit={handleGallerySubmit} className="terminal-input-container" style={{ marginTop: '2rem' }}>
                      <span className="terminal-prompt">{'>'}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                        <input
                          ref={galleryInputRef}
                          type="text"
                          className="terminal-input"
                          value={galleryInputValue}
                          onChange={(e) => setGalleryInputValue(e.target.value)}
                          placeholder={viewingImageIndex === null ? "type 'cd <filename>' to view, or 'abort' to exit..." : "type 'back' to return, or 'abort' to exit..."}
                          spellCheck="false"
                          autoFocus
                        />
                        {galleryError && (
                          <span style={{ color: 'red', marginTop: '5px', textShadow: 'none', fontSize: '1rem' }}>{galleryError}</span>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="glitch-text" style={{ marginTop: '2rem', whiteSpace: 'pre-wrap', color: '#0f0', textShadow: '0 0 5px rgba(0, 255, 0, 0.5)' }}>
                      {displayedText}
                      <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>_</motion.span>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {playingSong && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '20px',
              zIndex: 9999,
              background: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid #0f0',
              padding: '5px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 0 10px rgba(0,255,0,0.2)'
            }}
          >
            <CustomAudioPlayer src={playingSong.src} />
            <div style={{ color: '#0f0', fontFamily: 'monospace', paddingRight: '10px' }}>
              <div style={{ fontWeight: 'bold' }}>NOW PLAYING</div>
              <div style={{ fontSize: '0.8em', opacity: 0.8 }}>{playingSong.title}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlitchTerminal;
