import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  Palette, 
  Music, 
  MessageSquare, 
  Folder, 
  Trash2, 
  Power, 
  X, 
  Minus, 
  Square, 
  Play, 
  Pause, 
  SkipForward, 
  Volume2,
  RefreshCw,
  Download,
  Send,
  Heart,
  Image,
  Gamepad2,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  Key,
  FileText,
  Plus,
  Save,
  FilePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Camera,
  Edit2,
  Settings,
  Mail,
  Paperclip,
  Inbox,
  File,
  Video,
  Globe
} from 'lucide-react';


import './BunnyOS98.css';
import { uiSounds } from '../utils/UISounds';
import { poetryDB } from '../utils/PoetryDBService';
import { isSupabaseConfigured, getSupabaseConfig } from '../utils/supabaseClient';
import { messengerDB } from '../utils/MessengerDBService';
import { picturesDBService } from '../utils/PicturesDBService';
import { bunnyMailDB } from '../utils/BunnyMailDBService';

import RetroCameraApp from './RetroCameraApp';



const classifiedPhotos = [
  { name: 'us.jpg', title: 'Us', src: '/us.jpg' },
  { name: 'bhondu_and_bhondu_maharani.jpg', title: 'Bhondu & Bhondu Maharani', src: '/bhondu_and_bhondu_maharani.jpg' },
  { name: 'girly_poppies.jpg', title: 'Girly Poppies', src: '/girly_poppies.jpg' },
  { name: 'the_bhondu_group.jpg', title: 'The Bhondu Group', src: '/the_bhondu_group.jpg' },
  { name: 'the_og_group.jpg', title: 'The OG Group', src: '/the_og_group.jpg' },
  { name: 'three_intellectuals.jpg', title: 'Three Intellectuals', src: '/three_intellectuals.jpg' }
];

const PicturesApp = () => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [customTitles, setCustomTitles] = useState({});
  const [editingKey, setEditingKey] = useState(null);
  const [editInputVal, setEditInputVal] = useState('');

  const loadPhotosAndTitles = async () => {
    try {
      const photos = await picturesDBService.fetchPhotos();
      setCapturedPhotos(photos || []);
      const storedTitles = localStorage.getItem('bunny_photo_titles');
      if (storedTitles) {
        setCustomTitles(JSON.parse(storedTitles));
      }
    } catch (e) {
      console.error('Error loading pictures data:', e);
    }
  };

  useEffect(() => {
    loadPhotosAndTitles();
    const handleCaptured = () => loadPhotosAndTitles();
    window.addEventListener('bunny-photo-captured', handleCaptured);

    // Realtime Supabase subscription across devices
    const channel = picturesDBService.subscribeToPhotos((updatedPhotos) => {
      if (updatedPhotos) setCapturedPhotos(updatedPhotos);
    });

    return () => {
      window.removeEventListener('bunny-photo-captured', handleCaptured);
      picturesDBService.unsubscribeFromPhotos(channel);
    };
  }, []);

  const getPhotoKey = (photo) => photo.id || photo.name;
  const getPhotoTitle = (photo) => {
    const key = getPhotoKey(photo);
    return customTitles[key] || photo.title || photo.name;
  };

  const handleStartRename = (e, photo) => {
    e.stopPropagation();
    const key = getPhotoKey(photo);
    setEditingKey(key);
    setEditInputVal(getPhotoTitle(photo));
  };

  const handleSaveRename = async (photo) => {
    if (!editInputVal.trim()) return;
    const key = getPhotoKey(photo);
    const newTitle = editInputVal.trim();
    const updatedTitles = { ...customTitles, [key]: newTitle };
    setCustomTitles(updatedTitles);
    localStorage.setItem('bunny_photo_titles', JSON.stringify(updatedTitles));

    // Update inside Supabase / local storage if user-captured photo
    if (photo.isUserCaptured) {
      const updatedPhoto = { ...photo, title: newTitle };
      await picturesDBService.savePhoto(updatedPhoto);
      loadPhotosAndTitles();
    }

    if (selectedPhoto && getPhotoKey(selectedPhoto) === key) {
      setSelectedPhoto({ ...selectedPhoto, title: newTitle });
    }

    setEditingKey(null);
    uiSounds.playHoverTick();
  };

  const handleDeletePhoto = async (e, photo) => {
    e.stopPropagation();
    if (!photo.isUserCaptured) return;
    await picturesDBService.deletePhoto(photo.id);
    loadPhotosAndTitles();
    if (selectedPhoto && selectedPhoto.id === photo.id) {
      setSelectedPhoto(null);
    }
    uiSounds.playHoverTick();
  };

  const handleDownloadPhoto = (e, photo) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.download = `${getPhotoTitle(photo).replace(/[^a-z0-9]/gi, '_')}.jpg`;
    link.href = photo.src;
    link.click();
    uiSounds.playHoverTick();
  };

  const allPhotos = [
    ...capturedPhotos,
    ...classifiedPhotos.map(p => ({ ...p, id: p.name, isDefault: true }))
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', border: '1px inset #707070', padding: '10px', boxSizing: 'border-box' }}>
      {selectedPhoto ? (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '11px', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {editingKey === getPhotoKey(selectedPhoto) ? (
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={editInputVal}
                    onChange={(e) => setEditInputVal(e.target.value)}
                    style={{ fontSize: '11px', padding: '2px 4px', border: '1px solid #ff1493', fontFamily: 'monospace' }}
                    autoFocus
                  />
                  <button className="win98-btn" style={{ width: 'auto', padding: '1px 6px' }} onClick={() => handleSaveRename(selectedPhoto)}>Save</button>
                  <button className="win98-btn" style={{ width: 'auto', padding: '1px 6px' }} onClick={() => setEditingKey(null)}>Cancel</button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 'bold', color: '#ff1493', fontSize: '13px' }}>{getPhotoTitle(selectedPhoto)}</span>
                  <button
                    className="win98-btn"
                    style={{ width: 'auto', padding: '1px 5px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '2px' }}
                    onClick={(e) => handleStartRename(e, selectedPhoto)}
                    title="Rename picture"
                  >
                    <Edit2 size={10} /> Rename
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="win98-btn"
                style={{ width: 'auto', padding: '1px 6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                onClick={(e) => handleDownloadPhoto(e, selectedPhoto)}
              >
                <Download size={11} /> Save to Disk
              </button>

              <button className="win98-btn" style={{ width: 'auto', padding: '1px 6px', fontSize: '11px' }} onClick={() => setSelectedPhoto(null)}>
                ← Back to Gallery
              </button>
            </div>
          </div>

          <div style={{ flex: 1, width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#faf0f5', borderRadius: '4px', border: '1px solid #ffb6c1', padding: '4px' }}>
            <img src={selectedPhoto.src} alt={getPhotoTitle(selectedPhoto)} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', imageRendering: selectedPhoto.isUserCaptured ? 'pixelated' : 'auto' }} />
          </div>
        </div>
      ) : (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '4px', paddingBottom: '6px', marginBottom: '6px', borderBottom: '1px solid #ffccd5', fontSize: '11px', fontFamily: 'monospace' }}>
            <span style={{ fontWeight: 'bold', color: '#4a154b' }}>
              📁 PICTURES VAULT ({allPhotos.length} Photos)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                className="win98-btn"
                style={{ fontSize: '10px', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: '4px', color: '#ff1493', fontWeight: 'bold' }}
                onClick={() => toggleWindow('camera')}
              >
                <Camera size={12} color="#ff1493" /> Open Retro Camera
              </button>
              <span style={{ color: '#888', fontSize: '10px' }}>Snap & Save!</span>
            </div>
          </div>

          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gridAutoRows: 'max-content', alignContent: 'start', alignItems: 'start', gap: '10px', overflowY: 'auto', padding: '6px', width: '100%', boxSizing: 'border-box' }} onWheel={(e) => e.stopPropagation()}>

            {allPhotos.map((photo) => {
              const key = getPhotoKey(photo);
              const isEditing = editingKey === key;
              const title = getPhotoTitle(photo);

              return (
                <div
                  key={key}
                  onClick={() => setSelectedPhoto(photo)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    cursor: 'pointer',
                    padding: '8px 6px',
                    border: photo.isUserCaptured ? '1px solid #ff69b4' : '1px solid #ffccd5',
                    borderRadius: '6px',
                    background: photo.isUserCaptured ? '#fff0f6' : '#fff5f8',
                    position: 'relative',
                    height: 'fit-content',
                    width: '100%',
                    boxSizing: 'border-box',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  {photo.isUserCaptured && (
                    <span style={{ position: 'absolute', top: '3px', left: '3px', background: '#ff1493', color: '#fff', fontSize: '8px', padding: '1px 4px', borderRadius: '3px', fontWeight: 'bold', zIndex: 2 }}>
                      RETRO CAM 📷
                    </span>
                  )}

                  <div style={{ width: '100%', height: '75px', overflow: 'hidden', borderRadius: '4px', marginBottom: '6px', marginTop: photo.isUserCaptured ? '10px' : '0', background: '#eee' }}>
                    <img src={photo.src} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: photo.isUserCaptured ? 'pixelated' : 'auto' }} />
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }} onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editInputVal}
                        onChange={e => setEditInputVal(e.target.value)}
                        style={{ fontSize: '10px', padding: '2px 4px', width: '100%', fontFamily: 'monospace', boxSizing: 'border-box' }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        <button className="win98-btn" style={{ fontSize: '9px', padding: '1px 6px', width: 'auto' }} onClick={() => handleSaveRename(photo)}>Save</button>
                        <button className="win98-btn" style={{ fontSize: '9px', padding: '1px 6px', width: 'auto' }} onClick={() => setEditingKey(null)}>X</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                      <span style={{ fontSize: '10px', textAlign: 'center', color: '#4a154b', fontFamily: 'monospace', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', width: '100%', lineHeight: '1.2' }}>
                        {title}
                      </span>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                        <button
                          className="win98-btn"
                          style={{ fontSize: '9px', padding: '1px 5px', width: 'auto', display: 'flex', alignItems: 'center', gap: '2px' }}
                          onClick={e => handleStartRename(e, photo)}
                          title="Rename photo"
                        >
                          ✏️
                        </button>
                        <button
                          className="win98-btn"
                          style={{ fontSize: '9px', padding: '1px 5px', width: 'auto', display: 'flex', alignItems: 'center', gap: '2px' }}
                          onClick={e => handleDownloadPhoto(e, photo)}
                          title="Download photo"
                        >
                          💾
                        </button>
                        {photo.isUserCaptured && (
                          <button
                            className="win98-btn"
                            style={{ fontSize: '9px', padding: '1px 5px', width: 'auto', color: 'red' }}
                            onClick={e => handleDeletePhoto(e, photo)}
                            title="Delete captured photo"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};


// Audio tracks for BunnyAmp
const AMP_PLAYLIST = [
  { id: 1, title: 'Barse / Naina - Rumii & Chayan', src: '/barse naina.mp3' },
  { id: 2, title: 'Golden Hour - JVKE', src: '/golden hour.mp3' },
  { id: 3, title: 'Salvatore - Lana Del Rey', src: '/salvatore.mp3' },
  { id: 4, title: 'Yellow - Coldplay', src: '/yellow.mp3' }
];



// BunnyPaint Sub-Component
const BunnyPaintApp = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(4);
  const colors = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff69b4', '#8b4513'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setupCanvas = () => {
      const wrapper = canvas.parentElement;
      if (!wrapper) return;
      const rect = wrapper.getBoundingClientRect();
      const w = Math.max(300, rect.width || 400);
      const h = Math.max(200, rect.height || 240);

      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }
    };

    setupCanvas();
    const timer = setTimeout(setupCanvas, 100);
    return () => clearTimeout(timer);
  }, []);

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { x, y } = getCanvasCoords(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'bunny_artwork.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="bunnypaint-container">
      <div className="bunnypaint-toolbar">
        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
          {colors.map((c) => (
            <div
              key={c}
              className="color-picker-box"
              style={{ backgroundColor: c, outline: color === c ? '2px solid #ff1493' : 'none' }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            style={{ width: '60px' }}
          />
          <button className="win98-btn" style={{ width: 'auto', padding: '2px 8px', whiteSpace: 'nowrap' }} onClick={clearCanvas}>
            Clear
          </button>
          <button className="win98-btn" style={{ width: 'auto', padding: '2px 8px', whiteSpace: 'nowrap' }} onClick={downloadCanvas}>
            Save
          </button>
        </div>
      </div>
      <div 
        className="bunnypaint-canvas-wrapper"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => { e.stopPropagation(); startDrawing(e); }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
};

// Bunny Racer Arcade Sub-Component
const BunnyRacerApp = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('idle'); // idle, playing, gameover
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const playerLaneRef = useRef(1); // 0 = Left, 1 = Center, 2 = Right
  const [canvasDimensions, setCanvasDimensions] = useState({ w: 320, h: 260 });

  // Use ResizeObserver for 100% borderless responsive canvas sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setCanvasDimensions({
            w: Math.floor(width),
            h: Math.floor(height)
          });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const startGame = () => {
    setScore(0);
    playerLaneRef.current = 1;
    setGameState('playing');
    uiSounds.playHoverTick();
  };

  const moveLeft = () => {
    if (playerLaneRef.current > 0) {
      playerLaneRef.current -= 1;
      uiSounds.playHoverTick();
    }
  };

  const moveRight = () => {
    if (playerLaneRef.current < 2) {
      playerLaneRef.current += 1;
      uiSounds.playHoverTick();
    }
  };

  // Keyboard controls (Arrow keys / A D / Space)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveLeft();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveRight();
      } else if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp') {
        if (gameState !== 'playing') {
          e.preventDefault();
          startGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Main Game Loop with Proportional Scaling
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let roadOffsetY = 0;
    let currentScore = 0;
    let obstacles = []; // { lane, y, type: 'car' | 'heart' }
    let spawnTimer = 0;

    const gameLoop = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Clear screen
      ctx.fillStyle = '#0a0a16';
      ctx.fillRect(0, 0, w, h);

      // Draw Side Cyberpunk Grids
      const roadW = Math.min(w, Math.max(300, w * 0.8));
      const roadLeft = (w - roadW) / 2;
      const laneWidth = roadW / 3;

      // Side Grass/Neon Grid
      ctx.fillStyle = '#05050d';
      ctx.fillRect(0, 0, roadLeft, h);
      ctx.fillRect(roadLeft + roadW, 0, roadLeft, h);

      // Draw Main Road
      ctx.fillStyle = '#181828';
      ctx.fillRect(roadLeft, 0, roadW, h);

      // Draw Road Side Borders
      ctx.fillStyle = '#ff1493';
      ctx.fillRect(roadLeft - 4, 0, 4, h);
      ctx.fillRect(roadLeft + roadW, 0, 4, h);

      // Draw Moving Road Lines
      roadOffsetY = (roadOffsetY + 7) % 40;
      ctx.strokeStyle = '#ff69b4';
      ctx.lineWidth = Math.max(3, Math.floor(roadW / 120));
      ctx.setLineDash([22, 18]);
      ctx.lineDashOffset = -roadOffsetY;

      ctx.beginPath();
      ctx.moveTo(roadLeft + laneWidth, 0);
      ctx.lineTo(roadLeft + laneWidth, h);
      ctx.moveTo(roadLeft + laneWidth * 2, 0);
      ctx.lineTo(roadLeft + laneWidth * 2, h);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dash

      // Scale factor based on road width
      const scale = Math.max(0.95, roadW / 360);
      const carW = 38 * scale;
      const carH = 48 * scale;
      const playerRadius = 19 * scale;
      const heartFontSize = Math.max(22, Math.floor(28 * scale));

      // Spawn Obstacles & Heart Items
      spawnTimer++;
      if (spawnTimer > 26) {
        spawnTimer = 0;
        const randomLane = Math.floor(Math.random() * 3);
        const randomType = Math.random() < 0.4 ? 'heart' : 'car';
        obstacles.push({ lane: randomLane, y: -40, type: randomType });
      }

      // Update & Draw Items
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const item = obstacles[i];
        item.y += 4.5 * Math.max(1, h / 500);

        const itemX = roadLeft + item.lane * laneWidth + laneWidth / 2;

        if (item.type === 'heart') {
          // Draw Minimal Glowing Gem
          ctx.fillStyle = '#ff69b4';
          ctx.beginPath();
          ctx.moveTo(itemX, item.y - 10);
          ctx.lineTo(itemX + 8, item.y);
          ctx.lineTo(itemX, item.y + 10);
          ctx.lineTo(itemX - 8, item.y);
          ctx.closePath();
          ctx.fill();
        } else {
          // Draw Minimal Obstacle Car
          ctx.fillStyle = '#ff4365';
          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(itemX - carW / 2, item.y - carH / 2, carW, carH, 4);
            ctx.fill();
          } else {
            ctx.fillRect(itemX - carW / 2, item.y - carH / 2, carW, carH);
          }

          // Minimal Lights
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(itemX - carW / 2.8, item.y + carH / 2.8, carW / 4, carH / 10);
          ctx.fillRect(itemX + carW / 7, item.y + carH / 2.8, carW / 4, carH / 10);
        }

        // Collision Check with Player
        const playerY = h - 45;
        if (Math.abs(item.y - playerY) < (carH / 2 + playerRadius) && item.lane === playerLaneRef.current) {
          if (item.type === 'heart') {
            currentScore += 10;
            setScore(currentScore);
            uiSounds.playHoverTick();
            obstacles.splice(i, 1);
          } else {
            // Crash! Game Over
            uiSounds.playCinematicWhoosh();
            setHighScore(prev => Math.max(prev, currentScore));
            setGameState('gameover');
            cancelAnimationFrame(animId);
            return;
          }
        }

        // Remove offscreen
        if (item.y > h + 50) {
          obstacles.splice(i, 1);
          currentScore += 1;
          setScore(currentScore);
        }
      }

      // Draw Player Bunny Racer near bottom for maximum line-of-sight
      const playerX = roadLeft + playerLaneRef.current * laneWidth + laneWidth / 2;
      const playerY = h - 45;

      // Headlight Beams
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.moveTo(playerX - playerRadius, playerY);
      ctx.lineTo(playerX - playerRadius * 2, playerY - 140);
      ctx.lineTo(playerX + playerRadius * 2, playerY - 140);
      ctx.lineTo(playerX + playerRadius, playerY);
      ctx.fill();

      // Bunny Kart Body
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(playerX, playerY, playerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ff69b4';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Bunny Ears
      ctx.fillStyle = '#ffb6c1';
      ctx.beginPath();
      ctx.ellipse(playerX - playerRadius * 0.35, playerY - playerRadius * 1.2, playerRadius * 0.28, playerRadius * 0.65, 0, 0, Math.PI * 2);
      ctx.ellipse(playerX + playerRadius * 0.35, playerY - playerRadius * 1.2, playerRadius * 0.28, playerRadius * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();

      // Player Eyes & Nose
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.arc(playerX - playerRadius * 0.28, playerY - playerRadius * 0.15, playerRadius * 0.12, 0, Math.PI * 2);
      ctx.arc(playerX + playerRadius * 0.28, playerY - playerRadius * 0.15, playerRadius * 0.12, 0, Math.PI * 2);
      ctx.fill();

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, canvasDimensions]);

  return (
    <div className="arcade-container">
      {/* Pure Minimalist HUD Header */}
      <div className="arcade-hud-header">
        <div className="hud-badge pink">SCORE: {score}</div>
        <div className="hud-title">BUNNY RACER 98</div>
        <div className="hud-badge">BEST: {highScore}</div>
      </div>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="arcade-canvas-area">
        <canvas 
          ref={canvasRef} 
          width={canvasDimensions.w} 
          height={canvasDimensions.h} 
          style={{ width: '100%', height: '100%', display: 'block' }} 
        />

        {/* Start / Game Over Pure Minimalist Overlay */}
        {gameState !== 'playing' && (
          <div className="arcade-overlay-screen">
            <div className="arcade-overlay-card">
              <div className="arcade-title-glow">
                {gameState === 'idle' ? 'Bunny Racer 98' : 'GAME OVER'}
              </div>
              
              {gameState === 'gameover' && (
                <div style={{ fontSize: '15px', color: '#ff69b4', fontWeight: '600' }}>
                  Score: {score}
                </div>
              )}

              <div style={{ fontSize: '12px', color: '#a0a0c0', lineHeight: '1.6' }}>
                Use <b>Arrow Keys</b> or <b>A / D</b> to steer<br/>
                Collect gems & dodge obstacles
              </div>

              <button className="arcade-start-btn" onClick={startGame}>
                {gameState === 'idle' ? 'START RACE' : 'PLAY AGAIN'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pure Minimal Steer Control Buttons */}
      <div className="arcade-controls-footer">
        <button className="arcade-steer-btn" onClick={moveLeft}>
          LEFT
        </button>
        <button className="arcade-steer-btn" onClick={moveRight}>
          RIGHT
        </button>
      </div>
    </div>
  );
};

// Password Protected Dynamic Poetry Vault Sub-Component
const PoetryVaultApp = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dbStatus, setDbStatus] = useState('Connecting...');
  
  // Poetry State loaded dynamically from IndexedDB
  const [poems, setPoems] = useState([]);
  const [activePoemId, setActivePoemId] = useState(null);
  const [activeTitle, setActiveTitle] = useState('');
  const [activeContent, setActiveContent] = useState('');

  const saveTimeoutRef = useRef(null);

  // Initial Database Load
  useEffect(() => {
    let isMounted = true;
    const loadFromDB = async () => {
      try {
        const loadedPoems = await poetryDB.getAllPoems();
        if (isMounted && loadedPoems && loadedPoems.length > 0) {
          setPoems(loadedPoems);
          setActivePoemId(loadedPoems[0].id);
          setActiveTitle(loadedPoems[0].title);
          setActiveContent(loadedPoems[0].content);
          setDbStatus(isSupabaseConfigured ? 'Supabase Connected ⚡' : 'IndexedDB / Local Cache 💖');
        }
      } catch (err) {
        console.error('Database load error:', err);
        setDbStatus('Local Backup Storage');
      }
    };

    loadFromDB();
    return () => { isMounted = false; };
  }, []);

  // Sync active poem when selection changes
  useEffect(() => {
    if (!activePoemId || poems.length === 0) return;
    const poem = poems.find(p => p.id === activePoemId);
    if (poem) {
      setActiveTitle(poem.title);
      setActiveContent(poem.content);
    }
  }, [activePoemId]);

  // Direct Debounced Sync Function
  const syncToDatabase = (titleToSave, contentToSave, poemIdToSave) => {
    if (!poemIdToSave) return;
    setDbStatus('Syncing...');

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      await poetryDB.savePoem({
        id: poemIdToSave,
        title: titleToSave,
        content: contentToSave
      });
      setDbStatus('Synced to DB 💖');
    }, 250);
  };

  const handleTitleChange = (newTitle) => {
    setActiveTitle(newTitle);
    setPoems(prev => prev.map(p => p.id === activePoemId ? { ...p, title: newTitle } : p));
    syncToDatabase(newTitle, activeContent, activePoemId);
  };

  const handleContentChange = (newContent) => {
    setActiveContent(newContent);
    setPoems(prev => prev.map(p => p.id === activePoemId ? { ...p, content: newContent } : p));
    syncToDatabase(activeTitle, newContent, activePoemId);
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    const pass = passwordInput.trim().toLowerCase();
    if (pass === 'bareera' || pass === 'bunny' || pass === 'poet' || pass === '1234' || pass === 'bareera123') {
      setIsUnlocked(true);
      setErrorMsg('');
      uiSounds.playCinematicWhoosh();
    } else {
      setErrorMsg('Incorrect Password! Hint: Her name or "bunny"');
      uiSounds.playHoverTick();
    }
  };

  const handleSavePoem = async () => {
    if (!activePoemId) return;
    setDbStatus('Saving...');
    await poetryDB.savePoem({
      id: activePoemId,
      title: activeTitle,
      content: activeContent
    });
    setDbStatus('Saved to Vault 💖');
    uiSounds.playHoverTick();
  };

  const handleCreateNewPoem = async () => {
    const newId = String(Date.now());
    const newPoem = { id: newId, title: 'Untitled Poem', content: '' };
    setPoems(prev => [newPoem, ...prev]);
    setActivePoemId(newId);
    setActiveTitle('Untitled Poem');
    setActiveContent('');
    await poetryDB.savePoem(newPoem);
    setDbStatus('Record Saved');
    uiSounds.playHoverTick();
  };

  const handleDeletePoem = async (id) => {
    if (poems.length <= 1) return;
    const filtered = poems.filter(p => p.id !== id);
    setPoems(filtered);
    if (activePoemId === id) {
      setActivePoemId(filtered[0].id);
      setActiveTitle(filtered[0].title);
      setActiveContent(filtered[0].content);
    }
    await poetryDB.deletePoem(id);
    setDbStatus('Record Deleted');
    uiSounds.playHoverTick();
  };

  const handleFetchSupabase = async () => {
    const { isConfigured } = getSupabaseConfig();
    if (!isConfigured) {
      setDbStatus('Set Supabase URL & Key in .env to connect ⚡');
      uiSounds.playHoverTick();
      return;
    }

    setDbStatus('Fetching Cloud...');
    try {
      const cloudPoems = await poetryDB.fetchSupabasePoems();
      if (cloudPoems && cloudPoems.length > 0) {
        setPoems(cloudPoems);
        setActivePoemId(cloudPoems[0].id);
        setActiveTitle(cloudPoems[0].title);
        setActiveContent(cloudPoems[0].content);
        setDbStatus(`Loaded ${cloudPoems.length} from Supabase ⚡`);
      } else {
        setDbStatus('Supabase table empty');
      }
      uiSounds.playCinematicWhoosh();
    } catch (err) {
      console.warn('Fetch Supabase warning:', err);
      setDbStatus('Cloud offline - Using Local Vault 💖');
      uiSounds.playHoverTick();
    }
  };

  const handleDownloadPoem = () => {
    const element = document.createElement('a');
    const file = new Blob([`${activeTitle}\n\n${activeContent}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeTitle.replace(/\s+/g, '_')}.txt`;
    element.click();
  };

  if (!isUnlocked) {
    return (
      <div className="poetry-vault-lock-screen">
        <div className="vault-lock-card">
          <div className="vault-lock-icon">
            <Lock size={32} color="#ff69b4" />
          </div>
          <h3>POETRY VAULT</h3>
          <p>Password Protected Dossier</p>

          <form onSubmit={handleUnlock} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
            <input
              type="password"
              className="vault-input"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password..."
              autoFocus
            />
            {errorMsg && <div className="vault-error">{errorMsg}</div>}
            <button type="submit" className="vault-unlock-btn">
              UNLOCK VAULT
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="poetry-vault-container">
      {/* Sidebar List of Poems */}
      {!isSidebarCollapsed && (
        <div className="poetry-sidebar">
          <div className="poetry-sidebar-header">
            <span>POETRIES ({poems.length})</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="win98-btn" style={{ width: 'auto', padding: '2px 6px' }} onClick={handleCreateNewPoem} title="New Poem">
                <Plus size={12} /> New
              </button>
              <button className="win98-btn" style={{ width: 'auto', padding: '2px 6px' }} onClick={() => setIsSidebarCollapsed(true)} title="Collapse Sidebar">
                <PanelLeftClose size={12} />
              </button>
            </div>
          </div>
          <div className="poetry-list" onWheel={(e) => e.stopPropagation()}>
            {poems.map(poem => (
              <div
                key={poem.id}
                className={`poetry-item ${poem.id === activePoemId ? 'active' : ''}`}
                onClick={() => setActivePoemId(poem.id)}
              >
                <FileText size={14} />
                <span className="poetry-item-title">{poem.title || 'Untitled'}</span>
                {poems.length > 1 && (
                  <button
                    className="poetry-delete-btn"
                    onClick={(e) => { e.stopPropagation(); handleDeletePoem(poem.id); }}
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editor Main Content Area */}
      <div className="poetry-editor-main">
        <div className="poetry-toolbar">
          {isSidebarCollapsed && (
            <button className="win98-btn" style={{ width: 'auto', padding: '4px 8px' }} onClick={() => setIsSidebarCollapsed(false)} title="Expand Sidebar">
              <PanelLeftOpen size={14} />
            </button>
          )}
          <input
            type="text"
            className="poetry-title-input"
            value={activeTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Poem Title..."
          />
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className="win98-btn" style={{ width: 'auto', padding: '4px 10px' }} onClick={handleFetchSupabase} title="Sync Cloud Content from Supabase">
              <RefreshCw size={14} /> Sync Cloud
            </button>
            <button className="win98-btn" style={{ width: 'auto', padding: '4px 10px' }} onClick={handleSavePoem}>
              <Save size={14} /> Save
            </button>
            <button className="win98-btn" style={{ width: 'auto', padding: '4px 10px' }} onClick={handleDownloadPoem}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <textarea
          className="poetry-textarea"
          value={activeContent}
          onWheel={(e) => e.stopPropagation()}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Write poetry here..."
        />

        <div className="poetry-statusbar">
          <span>Words: {activeContent.trim() ? activeContent.trim().split(/\s+/).length : 0}</span>
          <span>Characters: {activeContent.length}</span>
          <span>Database: {dbStatus}</span>
        </div>
      </div>
    </div>
  );
};

// Title-bar drag and mouse-resize window component
const Win98WindowItem = ({ win, bringToFront, toggleWindow, toggleMaximizeWindow, closeWindow, onResizeWindow, children }) => {
  const dragControls = useDragControls();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const isMax = win.isMaximized || isMobile;

  const handleResizeMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = win.size.w;
    const startH = win.size.h;

    const onMouseMove = (moveEvent) => {
      const newW = Math.max(280, startW + (moveEvent.clientX - startX));
      const newH = Math.max(180, startH + (moveEvent.clientY - startY));
      onResizeWindow(win.id, { w: newW, h: newH });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return (
    <motion.div
      key={win.id}
      drag={!isMax}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={isMobile ? { y: '100%', opacity: 0 } : { scale: 0.95, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      exit={isMobile ? { y: '100%', opacity: 0 } : { scale: 0.95, opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`win98-window focused ${isMax ? 'maximized' : ''} ${isMobile ? 'mobile-app-card' : ''}`}
      style={isMobile ? {
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        zIndex: win.zIndex + 100,
        borderRadius: 0,
        border: 'none'
      } : isMax ? {
        left: 0,
        top: 0,
        width: '100%',
        height: 'calc(100% - 36px)',
        zIndex: win.zIndex,
        transform: 'none !important'
      } : {
        left: win.pos.x,
        top: win.pos.y,
        width: win.size.w,
        height: win.size.h,
        zIndex: win.zIndex
      }}
      onMouseDown={() => bringToFront(win.id)}
      onTouchStart={() => bringToFront(win.id)}
    >
      <div 
        className="win98-title-bar mobile-app-header"
        onPointerDown={(e) => !isMax && dragControls.start(e)}
        onDoubleClick={() => toggleMaximizeWindow(win.id)}
      >
        <div className="win98-title-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isMobile && (
            <button 
              type="button"
              className="mobile-back-btn" 
              onPointerDown={(e) => e.stopPropagation()}
              onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); closeWindow(win.id); }}
              onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
              style={{
                background: 'rgba(255,255,255,0.3)',
                border: '1px solid rgba(255,255,255,0.5)',
                color: '#fff',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ← Back
            </button>
          )}
          {win.id === 'poetry' && <Lock size={14} color="#ff1493" />}
          {win.id === 'paint' && <Palette size={14} />}
          {win.id === 'amp' && <Music size={14} />}
          {win.id === 'racer' && <Gamepad2 size={14} />}
          {win.id === 'docs' && <Folder size={14} />}
          {win.id === 'pictures' && <Image size={14} />}
          {win.id === 'trash' && <Trash2 size={14} />}
          <span>{win.title}</span>
        </div>
        <div className="win98-controls">
          {!isMobile && <button className="win98-btn" onClick={() => toggleWindow(win.id)}><Minus size={10} /></button>}
          {!isMobile && <button className="win98-btn" onClick={() => toggleMaximizeWindow(win.id)}><Square size={10} /></button>}
          <button 
            type="button"
            className="win98-btn" 
            onPointerDown={(e) => e.stopPropagation()}
            onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); closeWindow(win.id); }}
            onClick={(e) => { e.stopPropagation(); closeWindow(win.id); }}
            style={{ padding: '4px 8px', fontSize: '14px', fontWeight: 'bold' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="win98-window-body" onWheel={(e) => e.stopPropagation()}>
        {children}
      </div>

      {!isMax && !isMobile && (
        <div 
          className="win98-resize-handle"
          onMouseDown={handleResizeMouseDown}
          title="Drag to resize window"
        />
      )}
    </motion.div>
  );
};


// Aesthetic Mini Cassette Player Desktop Widget
const CassetteWidget = ({ isVisible, onClose }) => {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef(null);

  const currentTrack = AMP_PLAYLIST[currentTrackIdx];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleNext = () => {
    const nextIdx = (currentTrackIdx + 1) % AMP_PLAYLIST.length;
    setCurrentTrackIdx(nextIdx);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    const prevIdx = (currentTrackIdx - 1 + AMP_PLAYLIST.length) % AMP_PLAYLIST.length;
    setCurrentTrackIdx(prevIdx);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isVisible) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      className="cassette-widget"
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        autoPlay={isPlaying}
      />

      <div className="cassette-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Music size={13} color="#ff1493" /> BUNNY STEREO TAPE C-60
        </span>
        <button className="cassette-header-btn" onClick={onClose} title="Minimize Widget">
          <Minus size={14} />
        </button>
      </div>

      {/* Cassette Tape Window & Spinning Reels */}
      <div className="cassette-window">
        <div className={`cassette-reel ${isPlaying ? 'cassette-spin' : ''}`}>
          <div className="cassette-reel-spokes" />
          <div className="cassette-reel-center" />
        </div>

        <div className="cassette-tape-middle">
          <div className="cassette-spectrum">
            {[12, 16, 8, 14, 10, 15, 7, 13].map((h, i) => (
              <div
                key={i}
                className="cassette-spec-bar"
                style={{ height: isPlaying ? `${Math.random() * 12 + 4}px` : '3px' }}
              />
            ))}
          </div>
        </div>

        <div className={`cassette-reel ${isPlaying ? 'cassette-spin' : ''}`}>
          <div className="cassette-reel-spokes" />
          <div className="cassette-reel-center" />
        </div>
      </div>

      {/* Track Metadata & Controls */}
      <div className="cassette-meta">
        <div className="cassette-title" title={currentTrack.title}>
          🎵 {currentTrack.title}
        </div>

        <div className="cassette-seekbar-container">
          <span>{formatTime(currentTime)}</span>
          <input
            type="range"
            className="cassette-seekbar"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
          />
          <span>{formatTime(duration)}</span>
        </div>

        <div className="cassette-controls">
          <div className="cassette-vol-wrapper">
            <Volume2 size={13} color="#ff1493" />
            <input
              type="range"
              className="cassette-vol-slider"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button className="cassette-btn" onClick={handlePrev} title="Previous Track">
              <ChevronLeft size={16} />
            </button>
            <button className="cassette-btn play-btn" onClick={togglePlay} title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
            </button>
            <button className="cassette-btn" onClick={handleNext} title="Next Track">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Retro Audio Player Sub-Component for Voice Notes
const RetroAudioPlayer = ({ audioUrl, msgId, playingAudioId, setPlayingAudioId }) => {
  const isPlaying = playingAudioId === msgId;
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.play();
        setPlayingAudioId(msgId);
      }
    }
  };

  return (
    <div className="msn-audio-pill">
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setPlayingAudioId(null)}
        onPause={() => setPlayingAudioId((curr) => (curr === msgId ? null : curr))}
      />
      <button
        type="button"
        className="win98-btn msn-audio-play-btn"
        onClick={togglePlay}
      >
        {isPlaying ? '⏸️ Pause' : '▶️ Play Voice Note'}
      </button>

      <div className={`msn-audio-eq ${isPlaying ? 'playing' : ''}`}>
        <span />
        <span />
        <span />
        <span />
      </div>
      <span className="msn-audio-badge">🎙️ Voice Note</span>
    </div>
  );
};

// BunnySweeper 98 Mini-Game Sub-Component
const BunnySweeperApp = () => {
  const [board, setBoard] = useState([]);
  const [gameStatus, setGameStatus] = useState('idle'); // idle, playing, won, lost
  const [flagsCount, setFlagsCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  const ROWS = 9;
  const COLS = 9;
  const MINES = 10;

  const initBoard = () => {
    let newBoard = [];
    for (let r = 0; r < ROWS; r++) {
      let row = [];
      for (let c = 0; c < COLS; c++) {
        row.push({ r, c, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 });
      }
      newBoard.push(row);
    }
    setBoard(newBoard);
    setGameStatus('idle');
    setFlagsCount(0);
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    initBoard();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTimer = () => {
    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimer((t) => Math.min(999, t + 1));
      }, 1000);
    }
  };

  const handleCellClick = (r, c) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    let newBoard = board.map(row => row.map(cell => ({ ...cell })));
    let cell = newBoard[r][c];
    if (cell.isFlagged || cell.isRevealed) return;

    if (gameStatus === 'idle') {
      let placed = 0;
      while (placed < MINES) {
        let randR = Math.floor(Math.random() * ROWS);
        let randC = Math.floor(Math.random() * COLS);
        if ((randR !== r || randC !== c) && !newBoard[randR][randC].isMine) {
          newBoard[randR][randC].isMine = true;
          placed++;
        }
      }
      for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
          if (!newBoard[i][j].isMine) {
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                let nr = i + dr;
                let nc = j + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && newBoard[nr][nc].isMine) {
                  count++;
                }
              }
            }
            newBoard[i][j].neighborMines = count;
          }
        }
      }
      setGameStatus('playing');
      startTimer();
    }

    if (cell.isMine) {
      newBoard[r][c].isRevealed = true;
      for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
          if (newBoard[i][j].isMine) newBoard[i][j].isRevealed = true;
        }
      }
      setBoard(newBoard);
      setGameStatus('lost');
      if (timerRef.current) clearInterval(timerRef.current);
      uiSounds.playErrorBeep();
      return;
    }

    const revealRecursive = (b, rowIdx, colIdx) => {
      if (rowIdx < 0 || rowIdx >= ROWS || colIdx < 0 || colIdx >= COLS) return;
      let target = b[rowIdx][colIdx];
      if (target.isRevealed || target.isFlagged || target.isMine) return;
      target.isRevealed = true;
      if (target.neighborMines === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr !== 0 || dc !== 0) revealRecursive(b, rowIdx + dr, colIdx + dc);
          }
        }
      }
    };

    revealRecursive(newBoard, r, c);
    uiSounds.playHoverTick();

    let unrevealedNonMines = 0;
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (!newBoard[i][j].isMine && !newBoard[i][j].isRevealed) unrevealedNonMines++;
      }
    }

    if (unrevealedNonMines === 0) {
      setGameStatus('won');
      if (timerRef.current) clearInterval(timerRef.current);
      uiSounds.playCinematicWhoosh();
      import('canvas-confetti').then((confetti) => {
        confetti.default({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      });
    }

    setBoard(newBoard);
  };

  const handleCellRightClick = (e, r, c) => {
    e.preventDefault();
    if (gameStatus === 'won' || gameStatus === 'lost') return;
    let newBoard = board.map(row => row.map(cell => ({ ...cell })));
    let cell = newBoard[r][c];
    if (cell.isRevealed) return;

    cell.isFlagged = !cell.isFlagged;
    setFlagsCount((prev) => (cell.isFlagged ? prev + 1 : prev - 1));
    setBoard(newBoard);
    uiSounds.playHoverTick();
  };

  let smiley = '🐰';
  if (gameStatus === 'won') smiley = '😎';
  if (gameStatus === 'lost') smiley = '😵';

  return (
    <div className="heartsweeper-container">
      <div className="heartsweeper-header">
        <div className="heartsweeper-counter">{String(Math.max(0, MINES - flagsCount)).padStart(3, '0')}</div>
        <button className="heartsweeper-face-btn" onClick={initBoard} title="Reset Game">{smiley}</button>
        <div className="heartsweeper-counter">{String(timer).padStart(3, '0')}</div>
      </div>
      <div className="heartsweeper-grid">
        {board.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`heartsweeper-cell ${cell.isRevealed ? 'revealed' : ''} ${cell.isRevealed && cell.isMine ? 'mine' : ''}`}
              onClick={() => handleCellClick(r, c)}
              onContextMenu={(e) => handleCellRightClick(e, r, c)}
            >
              {cell.isRevealed ? (
                cell.isMine ? '🐰' : cell.neighborMines > 0 ? cell.neighborMines : ''
              ) : cell.isFlagged ? (
                '🥕'
              ) : ''}
            </div>
          ))
        )}
      </div>
    </div>
  );
};


// Animated Matrix Rain Canvas Sub-Component
const MatrixRainCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZBUNNYBAREERABHONDU';
    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize) || 20;
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 10, 2, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff66';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillStyle = Math.random() > 0.92 ? '#ffffff' : '#00ff66';
        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

// Animated Y2K Cyber Pink Grid Sub-Component
const PinkGridBackground = () => {
  return (
    <div className="pink-grid-wallpaper-bg">
      <div className="pink-grid-horizon" />
      <div className="pink-grid-perspective" />
    </div>
  );
};

// Bunny Explorer 98 Sub-Component (Authentic Internet Explorer 98 & Classic Google 1998)
const BunnyBrowserApp = () => {
  const [url, setUrl] = useState('http://www.google.com');
  const [inputUrl, setInputUrl] = useState('http://www.google.com');
  const [history, setHistory] = useState(['http://www.google.com']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigateTo = (newUrl) => {
    setIsLoading(true);
    let target = newUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'http://' + target;
    }
    setUrl(target);
    setInputUrl(target);
    setSearchResults(null);

    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(target);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    uiSounds.playHoverTick();

    setTimeout(() => setIsLoading(false), 350);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prev = historyIndex - 1;
      setHistoryIndex(prev);
      setUrl(history[prev]);
      setInputUrl(history[prev]);
      setSearchResults(null);
      uiSounds.playHoverTick();
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const next = historyIndex + 1;
      setHistoryIndex(next);
      setUrl(history[next]);
      setInputUrl(history[next]);
      setSearchResults(null);
      uiSounds.playHoverTick();
    }
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    const q = searchQuery.trim().toLowerCase();

    let results = [
      {
        title: `Bareera & Bhondu - Official Dossier & Vault`,
        url: `http://www.bunny.com/bareera-and-bhondu`,
        snippet: `Exclusive level-10 classified dossier on Bareera & Bhondu. Rated 100% adorable and eternal.`
      },
      {
        title: `Search result for "${searchQuery}" - BunnyOS Archives`,
        url: `http://www.bunny.com/search?q=${encodeURIComponent(searchQuery)}`,
        snippet: `Found 1,998,000 matches for "${searchQuery}". Every match confirms Bareera is the most amazing person ever!`
      },
      {
        title: `1998 Love & Poetry Archive`,
        url: `http://www.love-poetry.com/archive`,
        snippet: `Read beautiful romantic letters, quotes, and memories preserved inside the Vault.`
      }
    ];

    if (q.includes('bareera')) {
      results.unshift({
        title: `🌸 Bareera - The Most Brilliant & Beautiful Soul`,
        url: `http://www.bareera.com/official`,
        snippet: `Bareera (noun): Unmatched in brilliance, kindness, and grace. Owner of Bhondu's whole heart.`
      });
    } else if (q.includes('bhondu')) {
      results.unshift({
        title: `👤 Bhondu - Bareera's Dedicated Developer & Companion`,
        url: `http://www.bhondu.com/about`,
        snippet: `Bhondu: Forever building cool apps, games, and retro operating systems to make Bareera smile.`
      });
    }

    setSearchResults(results);
    uiSounds.playSuccessBeep();
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleFeelingLucky = () => {
    uiSounds.playCinematicWhoosh();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    navigateTo('http://www.bunny.com');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0', fontFamily: 'MS Sans Serif, Tahoma, sans-serif', boxSizing: 'border-box' }}>
      
      {/* Top Internet Explorer 98 Navigation Toolbar */}
      <div style={{ background: '#e0e0e0', borderBottom: '2px solid #808080', padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        
        {/* Row 1: Action Buttons & Animated e Logo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <button className="win98-btn" style={{ fontSize: '10px', padding: '2px 8px' }} onClick={handleBack} disabled={historyIndex === 0}>
              ← Back
            </button>
            <button className="win98-btn" style={{ fontSize: '10px', padding: '2px 8px' }} onClick={handleForward} disabled={historyIndex >= history.length - 1}>
              Forward →
            </button>
            <button className="win98-btn" style={{ fontSize: '10px', padding: '2px 8px' }} onClick={() => navigateTo(url)}>
              🔄 Refresh
            </button>
            <button className="win98-btn" style={{ fontSize: '10px', padding: '2px 8px' }} onClick={() => navigateTo('http://www.google.com')}>
              🏠 Home
            </button>
            <button className="win98-btn" style={{ fontSize: '10px', padding: '2px 8px', color: '#000080', fontWeight: 'bold' }} onClick={() => navigateTo('http://www.bunny.com')}>
              🌸 Bunny.com
            </button>
          </div>

          {/* Animated IE Globe / e-Logo */}
          <div style={{ width: '22px', height: '22px', background: 'radial-gradient(circle, #0080ff, #002288)', borderRadius: '50%', color: '#fff', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', fontStyle: 'italic', boxShadow: 'inset -2px -2px 4px #000', animation: isLoading ? 'spin 1s linear infinite' : 'none' }}>
            e
          </div>
        </div>

        {/* Row 2: Address Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); navigateTo(inputUrl); }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#444' }}>Address:</span>
          <input
            type="text"
            className="win98-input"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            style={{ flex: 1, fontSize: '11px', padding: '2px 6px', background: '#fff' }}
          />
          <button type="submit" className="win98-btn" style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 'bold' }}>
            Go ➔
          </button>
        </form>

        {/* Row 3: Bookmark Quick Bar */}
        <div style={{ display: 'flex', gap: '6px', fontSize: '10px', alignItems: 'center', paddingTop: '2px' }}>
          <span style={{ color: '#666', fontWeight: 'bold' }}>Bookmarks:</span>
          <button className="win98-btn" style={{ fontSize: '9px', padding: '1px 5px' }} onClick={() => navigateTo('http://www.google.com')}>🔍 Google 1998</button>
          <button className="win98-btn" style={{ fontSize: '9px', padding: '1px 5px' }} onClick={() => navigateTo('http://www.yahoo.com')}>🟣 Yahoo! 98</button>
          <button className="win98-btn" style={{ fontSize: '9px', padding: '1px 5px' }} onClick={() => navigateTo('http://www.bunny.com')}>🌸 Bunny.com</button>
          <button className="win98-btn" style={{ fontSize: '9px', padding: '1px 5px' }} onClick={() => navigateTo('http://www.encarta.com')}>📖 Encarta 98</button>
          <button className="win98-btn" style={{ fontSize: '9px', padding: '1px 5px' }} onClick={() => navigateTo('http://www.lovenotes.com')}>💌 Love Notes</button>
        </div>
      </div>

      {/* Main Browser Viewport Area */}
      <div style={{ flex: 1, background: '#fff', border: '2px inset #808080', margin: '4px', overflowY: 'auto', position: 'relative' }} onWheel={(e) => e.stopPropagation()}>
        
        {url.includes('google.com') ? (
          /* CLASSIC 1998 GOOGLE PAGE */
          <div style={{ padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Times New Roman, Georgia, serif' }}>
            
            {/* Authentic 1998 Google Logo */}
            <div style={{ fontSize: '48px', fontWeight: 'bold', letterSpacing: '-1px', marginBottom: '4px', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
              <span style={{ color: '#174ea6' }}>G</span>
              <span style={{ color: '#ea4335' }}>o</span>
              <span style={{ color: '#fbbc05' }}>o</span>
              <span style={{ color: '#174ea6' }}>g</span>
              <span style={{ color: '#34a853' }}>l</span>
              <span style={{ color: '#ea4335' }}>e</span>
              <span style={{ color: '#174ea6', fontSize: '52px', fontStyle: 'italic' }}>!</span>
            </div>
            <div style={{ fontSize: '11px', color: '#666', fontFamily: 'monospace', marginBottom: '20px' }}>
              Search the Web using Google! (Beta - 1998 Edition)
            </div>

            {/* 1998 Search Form */}
            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '480px' }}>
              <input
                type="text"
                className="win98-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Google 1998 (e.g. Bareera, Bhondu, Love)..."
                style={{ width: '100%', fontSize: '14px', padding: '6px 10px', fontFamily: 'sans-serif' }}
                autoFocus
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="win98-btn" style={{ padding: '4px 14px', fontSize: '12px', fontWeight: 'bold' }}>
                  Google Search
                </button>
                <button type="button" className="win98-btn" style={{ padding: '4px 14px', fontSize: '12px' }} onClick={handleFeelingLucky}>
                  I'm Feeling Lucky
                </button>
              </div>
            </form>

            {/* Search Results Display */}
            {searchResults && (
              <div style={{ width: '100%', maxWidth: '560px', marginTop: '24px', borderTop: '1px solid #ccc', paddingTop: '16px', fontFamily: 'Arial, sans-serif' }}>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '12px' }}>
                  Results 1 - {searchResults.length} of about {searchResults.length} for <b>{searchQuery}</b>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {searchResults.map((res, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <a href="#" onClick={(e) => { e.preventDefault(); navigateTo(res.url); }} style={{ fontSize: '14px', color: '#0000cc', textDecoration: 'underline', fontWeight: 'bold' }}>
                        {res.title}
                      </a>
                      <span style={{ fontSize: '10px', color: '#008000', fontFamily: 'monospace' }}>{res.url}</span>
                      <span style={{ fontSize: '12px', color: '#222', lineHeight: '1.4' }}>{res.snippet}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer 1998 Links */}
            <div style={{ marginTop: '40px', fontSize: '10px', color: '#666', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '12px', width: '100%', maxWidth: '500px' }}>
              Copyright ©1998 Google Inc. | Special Edition built for Bareera & Bhondu 💖
            </div>
          </div>
        ) : url.includes('yahoo.com') ? (
          /* RETRO 1998 YAHOO! DIRECTORY */
          <div style={{ padding: '20px', fontFamily: 'Times New Roman, serif' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff0000', fontStyle: 'italic', marginBottom: '4px' }}>
              YAHOO! 98 💜
            </div>
            <div style={{ fontSize: '11px', color: '#555', marginBottom: '16px' }}>
              The Web Directory for 1998
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '12px' }}>
              <div>
                <b style={{ color: '#0000cc' }}>🌸 Bareera & Bhondu Directory</b>
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('http://www.bunny.com'); }}>Bunny OS Official Portal</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('http://www.lovenotes.com'); }}>Sweet Letters & Quotes</a></li>
                </ul>
              </div>
              <div>
                <b style={{ color: '#0000cc' }}>🎮 Retro Games & Entertainment</b>
                <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('http://www.google.com'); }}>Classic Google Search</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); navigateTo('http://www.encarta.com'); }}>Encarta 98 Encyclopedia</a></li>
                </ul>
              </div>
            </div>
          </div>
        ) : url.includes('bunny.com') ? (
          /* BUNNY.COM PORTAL PAGE */
          <div style={{ padding: '20px', fontFamily: 'Tahoma, sans-serif', background: 'linear-gradient(to bottom, #fff0f6, #ffffff)', height: '100%' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff1493', marginBottom: '6px' }}>
              🌸 Bunny.com Official Web Portal
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginBottom: '16px' }}>
              Welcome Bareera! Today's Forecast: 100% Sunshine & Eternal Affection 💖
            </div>

            <div style={{ border: '2px dashed #ff69b4', padding: '14px', borderRadius: '6px', background: '#fff', marginBottom: '16px' }}>
              <div style={{ fontWeight: 'bold', color: '#000080', fontSize: '13px', marginBottom: '6px' }}>
                💌 Daily Quote for Bareera:
              </div>
              <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#333', lineHeight: '1.5' }}>
                "In a universe full of endless stars, you are the brightest light of all."
              </div>
            </div>
          </div>
        ) : url.includes('encarta.com') ? (
          /* ENCARTA 98 ENCYCLOPEDIA */
          <div style={{ padding: '20px', fontFamily: 'Georgia, serif' }}>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#003366', borderBottom: '2px solid #003366', paddingBottom: '4px', marginBottom: '12px' }}>
              📖 Microsoft Encarta '98 Encyclopedia
            </div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff1493', marginBottom: '8px' }}>
              Entry: Bareera (Subject Code: MAXIMUM_PRECIOUS)
            </div>
            <p style={{ fontSize: '12px', lineHeight: '1.6', color: '#222' }}>
              <b>Bareera</b> is an exceptionally brilliant, kind-hearted, and beautiful individual known for her captivating smile and warmth. Historical records confirm that she is Bhondu's favorite person in the entire world.
            </p>
          </div>
        ) : (
          /* DEFAULT PAGE VIEW */
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#000080', marginBottom: '8px' }}>
              🌐 Web Page Loaded: {url}
            </div>
            <p style={{ fontSize: '12px' }}>You are viewing {url} inside Bunny Explorer 98.</p>
          </div>
        )}
      </div>
    </div>
  );
};


// Desktop Wallpaper Customizer Sub-Component
const WallpaperPickerApp = ({ activeWallpaper, setActiveWallpaper, customWallpaperUrl, setCustomWallpaperUrl }) => {
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  const presets = [
    {
      id: 'bougainvillea',
      name: 'Bougainvillea Floral 🌸',
      description: 'Blooming Pink Bougainvillea Flowers',
      thumbnailSrc: '/bougainvillea_wallpaper.jpg'
    },
    {
      id: 'sakura',
      name: 'Cherry Blossom Sakura 🌸',
      description: 'Spring Pink Cherry Blossom Bloom',
      thumbnailSrc: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=600&auto=format&fit=crop'
    },

    {
      id: 'roses',
      name: 'Vintage Rose Garden 🌹',
      description: 'Soft Pink Romantic Floral Roses',
      thumbnailSrc: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop'
    },
    {
      id: 'teal',
      name: 'Classic Win98 Teal 🖥️',
      description: 'Authentic 1998 nostalgic desktop',
      thumbnailSrc: null,
      customPreviewStyle: { background: '#008080', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '32px' },
      customText: '🖥️'
    },
    {
      id: 'pinkgrid',
      name: 'Y2K Cyber Pink Grid 💖',
      description: 'Live Animated Synthwave Neon Grid',
      thumbnailSrc: null,
      customPreviewStyle: {
        background: 'linear-gradient(to bottom, #1a002c, #3d0043)',
        backgroundImage: 'linear-gradient(rgba(255,20,147,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,20,147,0.5) 1px, transparent 1px)',
        backgroundSize: '16px 16px'
      }
    },
    {
      id: 'matrix',
      name: 'Matrix Digital Rain 🟢',
      description: 'Live Animated Hacker Code Streams',
      thumbnailSrc: null,
      customPreviewStyle: {
        background: '#000',
        color: '#00ff00',
        fontFamily: 'monospace',
        fontSize: '11px',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        textAlign: 'center'
      },
      customText: '010101\n101010\n010101'
    }
  ];


  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      setCustomWallpaperUrl(dataUrl);
      setActiveWallpaper('custom');
      localStorage.setItem('bunnyos_wallpaper', 'custom');
      localStorage.setItem('bunnyos_custom_wallpaper_url', dataUrl);
      uiSounds.playSuccessBeep();
    };
    reader.readAsDataURL(file);
  };

  const handleUrlSubmit = (e) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    setCustomWallpaperUrl(url);
    setActiveWallpaper('custom');
    localStorage.setItem('bunnyos_wallpaper', 'custom');
    localStorage.setItem('bunnyos_custom_wallpaper_url', url);
    setUrlInput('');
    uiSounds.playSuccessBeep();
  };

  return (
    <div
      style={{
        padding: '16px',
        background: '#e6e6e6',
        fontFamily: 'MS Sans Serif, Tahoma, sans-serif',
        height: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}
      onWheel={(e) => e.stopPropagation()}
    >
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ff1493', paddingBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ fontWeight: 'bold', color: '#ff1493', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🖼️ Desktop Wallpaper Gallery
        </div>
        <span style={{ fontSize: '11px', color: '#444', fontWeight: 'bold' }}>
          Click any picture to change desktop wallpaper!
        </span>
      </div>

      {/* Picture Wallpaper Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px' }}>
        {presets.map((wp) => {
          const isActive = activeWallpaper === wp.id;

          return (
            <div
              key={wp.id}
              onClick={() => {
                setActiveWallpaper(wp.id);
                localStorage.setItem('bunnyos_wallpaper', wp.id);
                uiSounds.playHoverTick();
              }}
              style={{
                border: isActive ? '3px solid #ff1493' : '1px solid #b0b0b0',
                background: isActive ? '#fff0f6' : '#ffffff',
                boxShadow: isActive ? '0 0 12px rgba(255, 20, 147, 0.45)' : '0 2px 5px rgba(0,0,0,0.1)',
                borderRadius: '6px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              {/* Picture Thumbnail Frame */}
              <div style={{ width: '100%', height: '110px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #999', position: 'relative', background: '#000' }}>
                {wp.thumbnailSrc ? (
                  <img
                    src={wp.thumbnailSrc}
                    alt={wp.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', ...wp.customPreviewStyle }}>
                    {wp.customText || ''}
                  </div>
                )}
                {isActive && (
                  <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#ff1493', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 7px', borderRadius: '3px', boxShadow: '0 2px 4px rgba(0,0,0,0.4)', letterSpacing: '0.5px' }}>
                    ACTIVE ✔
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: isActive ? '#ff1493' : '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {wp.name}
                </span>
                <span style={{ fontSize: '10px', color: '#666', lineHeight: '1.3' }}>
                  {wp.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Upload Section */}
      <div style={{ border: '1px inset #a0a0a0', padding: '12px', background: '#f5f5f5', borderRadius: '6px', marginTop: '4px' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ff1493', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ✨ Custom Uploaded Picture Wallpaper:
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="win98-btn"
            style={{ fontSize: '11px', padding: '5px 14px', fontWeight: 'bold', color: '#0055ea', display: 'flex', alignItems: 'center', gap: '6px', background: '#fff' }}
            onClick={() => fileInputRef.current?.click()}
          >
            📁 Choose Photo from Device...
          </button>
        </div>

        <form onSubmit={handleUrlSubmit} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input
            type="text"
            className="win98-input"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="or paste custom picture URL..."
            style={{ flex: 1, fontSize: '11px', padding: '4px 8px', borderRadius: '3px' }}
          />
          <button type="submit" className="win98-btn" style={{ fontSize: '11px', padding: '4px 12px', fontWeight: 'bold' }}>
            Set Wallpaper URL
          </button>
        </form>

        {activeWallpaper === 'custom' && customWallpaperUrl && (
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#008800', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ✔️ Custom Wallpaper Active & Saved!
          </div>
        )}
      </div>
    </div>
  );
};



// Bunny Mail 98 Sub-Component (Retro Webmail & Supabase Real-Time Client)
const BunnyMailApp = () => {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox', 'sent', 'compose'
  const [authenticatedAccount, setAuthenticatedAccount] = useState(() => {
    return localStorage.getItem('bunny_mail_auth_account') || null;
  });

  const [selectedAccount, setSelectedAccount] = useState('Bunny');
  const [nameInput, setNameInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [mails, setMails] = useState([]);
  const [selectedMail, setSelectedMail] = useState(null);

  const currentAccount = authenticatedAccount || 'bareera@bunny.com';
  const recipientAccount = currentAccount === 'bareera@bunny.com' ? 'bhondu@bunny.com' : 'bareera@bunny.com';
  const [composeTo, setComposeTo] = useState(currentAccount === 'bareera@bunny.com' ? 'bhondu@bunny.com' : 'bareera@bunny.com');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setLoginError('');

    let targetAccount = selectedAccount;
    if (nameInput.trim()) {
      targetAccount = nameInput.trim().toLowerCase().includes('bhondu') ? 'Bhondu' : 'Bunny';
    }

    const fullAccount = targetAccount === 'Bhondu' ? 'bhondu@bunny.com' : 'bareera@bunny.com';
    setAuthenticatedAccount(fullAccount);
    localStorage.setItem('bunny_mail_auth_account', fullAccount);
    uiSounds.playSuccessBeep();
  };

  const handleSignOut = () => {
    setAuthenticatedAccount(null);
    localStorage.removeItem('bunny_mail_auth_account');
    setNameInput('');
    setLoginError('');
    uiSounds.playHoverTick();
  };

  // Sync composer recipient when account changes
  useEffect(() => {
    setComposeTo(currentAccount === 'bareera@bunny.com' ? 'bhondu@bunny.com' : 'bareera@bunny.com');
  }, [currentAccount]);

  // Load emails & subscribe to real-time updates when authenticated
  useEffect(() => {
    if (!authenticatedAccount) return;
    let isMounted = true;

    const loadMails = async () => {
      const fetched = await bunnyMailDB.fetchMails();
      if (isMounted && fetched) {
        setMails(fetched);
      }
    };

    loadMails();

    const unsubscribe = bunnyMailDB.subscribeToMails((newMail) => {
      if (!isMounted) return;
      setMails((prev) => {
        if (prev.some((m) => m.id === newMail.id)) return prev;
        return [newMail, ...prev];
      });

      if (newMail.recipient && newMail.recipient.toLowerCase().includes(currentAccount.toLowerCase())) {
        uiSounds.playIncomingMsg();
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [authenticatedAccount, currentAccount]);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = {
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl: event.target.result
        };
        setAttachments((prev) => [...prev, fileData]);
        uiSounds.playHoverTick();
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    uiSounds.playHoverTick();
  };

  const handleSendMail = async (e) => {
    if (e) e.preventDefault();
    if (!composeSubject.trim() && !composeBody.trim() && attachments.length === 0) return;

    const targetEmail = composeTo.trim() || recipientAccount;
    const newMail = await bunnyMailDB.sendMail({
      sender: currentAccount,
      recipient: targetEmail,
      subject: composeSubject.trim() || '(No Subject)',
      body: composeBody.trim(),
      attachments: attachments
    });

    setMails((prev) => [newMail, ...prev.filter(m => m.id !== newMail.id)]);

    setComposeSubject('');
    setComposeBody('');
    setAttachments([]);
    setActiveTab('sent');
    setSelectedMail(newMail);
    uiSounds.playSuccessBeep();
  };

  const inboxMails = mails.filter(m => m.recipient && m.recipient.toLowerCase().includes(currentAccount.toLowerCase()));
  const sentMails = mails.filter(m => m.sender && m.sender.toLowerCase().includes(currentAccount.toLowerCase()));
  const displayedMails = activeTab === 'inbox' ? inboxMails : sentMails;

  const currentDisplayName = currentAccount.includes('bhondu') ? 'Bhondu' : 'Bunny';

  if (!authenticatedAccount) {
    return (
      <div className="msn-signin-overlay" onWheel={(e) => e.stopPropagation()}>
        <div className="msn-signin-box" style={{ borderColor: '#ff1493' }}>
          <div className="msn-signin-banner" style={{ background: 'linear-gradient(to right, #ff1493, #ff69b4)', borderBottomColor: '#c71585' }}>
            <span className="msn-signin-logo">📬</span>
            <div>
              <div className="msn-signin-title">Bunny Mail 98</div>
              <div className="msn-signin-subtitle">Retro Webmail & Attachment Client</div>
            </div>
          </div>

          <form onSubmit={handleLogin} className="msn-signin-body">
            <div className="msn-signin-label">Select Account:</div>
            <div className="msn-account-tabs" style={{ marginBottom: '8px' }}>
              <button
                type="button"
                className={`msn-account-btn ${selectedAccount === 'Bunny' ? 'selected' : ''}`}
                style={{ background: selectedAccount === 'Bunny' ? '#ff1493' : '#e6f0fa', color: selectedAccount === 'Bunny' ? '#fff' : '#003366' }}
                onClick={() => { setSelectedAccount('Bunny'); setNameInput(''); setLoginError(''); uiSounds.playHoverTick(); }}
              >
                🌸 Bunny
              </button>
              <button
                type="button"
                className={`msn-account-btn ${selectedAccount === 'Bhondu' ? 'selected' : ''}`}
                style={{ background: selectedAccount === 'Bhondu' ? '#0055ea' : '#e6f0fa', color: selectedAccount === 'Bhondu' ? '#fff' : '#003366' }}
                onClick={() => { setSelectedAccount('Bhondu'); setNameInput(''); setLoginError(''); uiSounds.playHoverTick(); }}
              >
                👤 Bhondu
              </button>
            </div>

            <div className="msn-password-field" style={{ marginBottom: '8px' }}>
              <label className="msn-signin-label">Name Address:</label>
              <input
                type="text"
                className="msn-password-input"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder=""
                autoFocus
              />
            </div>

            {loginError && (
              <div className="msn-signin-error" style={{ marginTop: '8px' }}>
                <span>⚠️ {loginError}</span>
              </div>
            )}

            <button type="submit" className="win98-btn msn-signin-submit" style={{ background: 'linear-gradient(to bottom, #ff69b4, #ff1493)', borderColor: '#c71585', marginTop: '12px' }}>
              Open Mailbox 📬
            </button>
          </form>
        </div>
      </div>
    );
  }


  return (
    <div className="bunny-mail-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#c0c0c0', fontFamily: 'MS Sans Serif, Tahoma, sans-serif', boxSizing: 'border-box' }}>
      {/* Account Selector & Sign Out Bar */}
      <div style={{ background: 'linear-gradient(to right, #ff1493, #ff69b4)', padding: '4px 10px', color: '#fff', fontSize: '11px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Mail size={14} /> Mailbox: <span style={{ color: '#ffff00' }}>{currentDisplayName}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            type="button"
            className="win98-btn"
            style={{ fontSize: '9px', padding: '1px 8px', fontWeight: 'bold' }}
            onClick={handleSignOut}
          >
            🔑 Sign Out / Switch Account
          </button>
        </div>
      </div>



      {/* Top Mail Toolbar */}
      <div style={{ display: 'flex', gap: '6px', padding: '6px', background: '#e0e0e0', borderBottom: '1px solid #999', alignItems: 'center' }}>
        <button
          className="win98-btn"
          style={{ fontSize: '11px', padding: '3px 8px', background: activeTab === 'inbox' ? '#fff' : '#e0e0e0', fontWeight: activeTab === 'inbox' ? 'bold' : 'normal' }}
          onClick={() => { setActiveTab('inbox'); setSelectedMail(null); uiSounds.playHoverTick(); }}
        >
          📥 Inbox ({inboxMails.length})
        </button>
        <button
          className="win98-btn"
          style={{ fontSize: '11px', padding: '3px 8px', background: activeTab === 'sent' ? '#fff' : '#e0e0e0', fontWeight: activeTab === 'sent' ? 'bold' : 'normal' }}
          onClick={() => { setActiveTab('sent'); setSelectedMail(null); uiSounds.playHoverTick(); }}
        >
          📤 Sent ({sentMails.length})
        </button>
        <button
          className="win98-btn"
          style={{ fontSize: '11px', padding: '3px 8px', background: activeTab === 'compose' ? '#ff69b4' : '#e0e0e0', color: activeTab === 'compose' ? '#fff' : '#000', fontWeight: 'bold' }}
          onClick={() => { setActiveTab('compose'); setSelectedMail(null); uiSounds.playHoverTick(); }}
        >
          ✏️ Compose Mail
        </button>
      </div>

      {/* Main Content Area */}
      {activeTab === 'compose' ? (
        <form onSubmit={handleSendMail} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px', gap: '8px', overflowY: 'auto' }} onWheel={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '60px', fontSize: '11px', fontWeight: 'bold' }}>From:</span>
            <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#000080' }}>{currentAccount}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '60px', fontSize: '11px', fontWeight: 'bold' }}>To:</span>
            <input
              type="text"
              className="win98-input"
              value={composeTo}
              onChange={(e) => setComposeTo(e.target.value)}
              style={{ flex: 1, fontSize: '11px', padding: '3px 6px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '60px', fontSize: '11px', fontWeight: 'bold' }}>Subject:</span>
            <input
              type="text"
              className="win98-input"
              value={composeSubject}
              onChange={(e) => setComposeSubject(e.target.value)}
              placeholder="Enter email subject..."
              style={{ flex: 1, fontSize: '11px', padding: '3px 6px' }}
            />
          </div>

          {/* Attachments Section */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#d8d8d8', padding: '6px', borderRadius: '3px', border: '1px solid #aaa' }}>
            <span style={{ fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Paperclip size={13} /> Attachments:
            </span>
            <input
              type="file"
              ref={fileInputRef}
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.txt"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              className="win98-btn"
              style={{ fontSize: '10px', padding: '2px 8px' }}
              onClick={() => fileInputRef.current?.click()}
            >
              📁 Add Files/Photos/Videos...
            </button>
          </div>

          {/* Attachments Preview Badges */}
          {attachments.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '4px' }}>
              {attachments.map((att, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #777', padding: '3px 6px', borderRadius: '3px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>📎 {att.name}</span>
                  <button type="button" onClick={() => removeAttachment(i)} style={{ border: 'none', background: 'transparent', color: 'red', fontWeight: 'bold', cursor: 'pointer' }}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Email Body Textarea */}
          <textarea
            className="win98-input"
            value={composeBody}
            onChange={(e) => setComposeBody(e.target.value)}
            placeholder="Write your email message here..."
            style={{ flex: 1, minHeight: '140px', fontSize: '12px', fontFamily: 'MS Sans Serif, Tahoma, sans-serif', padding: '6px', resize: 'none' }}
            onWheel={(e) => e.stopPropagation()}
          />

          <button type="submit" className="win98-btn" style={{ padding: '6px 16px', background: '#0055ea', color: '#fff', fontWeight: 'bold', fontSize: '12px', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={14} /> Send Email
          </button>
        </form>
      ) : selectedMail ? (
        /* Single Email View */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px', background: '#fff', border: '1px inset #808080', margin: '4px', overflowY: 'auto' }} onWheel={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '6px' }}>
            <button className="win98-btn" style={{ fontSize: '10px', padding: '2px 8px' }} onClick={() => setSelectedMail(null)}>
              ← Back to list
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '10px', color: '#777' }}>
                {new Date(selectedMail.created_at || Date.now()).toLocaleString()}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#000080', marginBottom: '4px' }}>
            {selectedMail.subject}
          </div>
          <div style={{ fontSize: '11px', color: '#555', marginBottom: '8px' }}>
            From: <b>{selectedMail.sender}</b> | To: <b>{selectedMail.recipient}</b>
          </div>

          <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px', lineHeight: '1.5', flex: 1, borderTop: '1px solid #eee', paddingTop: '10px' }}>
            {selectedMail.body}
          </div>

          {/* Attachments Renderer */}
          {selectedMail.attachments && selectedMail.attachments.length > 0 && (
            <div style={{ marginTop: '16px', borderTop: '2px dashed #ffb6c1', paddingTop: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#ff1493', marginBottom: '8px' }}>
                📎 Attachments ({selectedMail.attachments.length}):
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedMail.attachments.map((att, i) => (
                  <div key={i} style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '8px', background: '#fafafa' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>📄 {att.name}</span>
                      <a href={att.dataUrl} download={att.name} style={{ textDecoration: 'none' }}>
                        <button className="win98-btn" style={{ fontSize: '9px', padding: '1px 6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Download size={10} /> Save File
                        </button>
                      </a>
                    </div>

                    {att.type && att.type.startsWith('image/') && (
                      <div style={{ maxWidth: '100%', maxHeight: '250px', overflow: 'hidden', borderRadius: '4px', border: '1px solid #ddd' }}>
                        <img src={att.dataUrl} alt={att.name} style={{ maxWidth: '100%', maxHeight: '250px', objectFit: 'contain' }} />
                      </div>
                    )}

                    {att.type && att.type.startsWith('video/') && (
                      <video src={att.dataUrl} controls style={{ width: '100%', maxHeight: '250px', borderRadius: '4px' }} />
                    )}

                    {att.type && att.type.startsWith('audio/') && (
                      <audio src={att.dataUrl} controls style={{ width: '100%' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Email List View */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', border: '1px inset #808080', margin: '4px', overflowY: 'auto' }} onWheel={(e) => e.stopPropagation()}>
          {displayedMails.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '12px' }}>
              No emails in {activeTab} for {currentAccount}.
            </div>
          ) : (
            displayedMails.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderBottom: '1px solid #e5e5e5',
                  cursor: 'pointer',
                  background: selectedMail?.id === m.id ? '#e4effe' : '#fff'
                }}
                onClick={() => { setSelectedMail(m); uiSounds.playHoverTick(); }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#000080' }}>
                    {activeTab === 'inbox' ? `From: ${m.sender}` : `To: ${m.recipient}`}
                  </div>
                  <div style={{ fontSize: '11px', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.subject} {m.attachments?.length > 0 ? `📎 (${m.attachments.length})` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '10px' }}>
                  <span style={{ fontSize: '9px', color: '#888', whiteSpace: 'nowrap' }}>
                    {new Date(m.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};







// Bunny Messenger 98 Sub-Component (Retro MSN/AIM Real-time Chat)
const BunnyMessengerApp = ({ triggerNudgeShake }) => {
  const [authenticatedUser, setAuthenticatedUser] = useState(() => localStorage.getItem('bunny_messenger_auth_user') || null);
  const [selectedUser, setSelectedUser] = useState('Bareera');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [statusMsg, setStatusMsg] = useState('Online 🟢');
  const [customStatus, setCustomStatus] = useState('Listening to Lana Del Rey... 🎶');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Voice Note Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Voice Note Timer
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result;
          uiSounds.playOutgoingMsg();

          const sent = await messengerDB.sendMessage({
            sender: authenticatedUser,
            content: base64Audio,
            type: 'audio'
          });

          setMessages((prev) => {
            if (prev.some((m) => m.id === sent.id)) return prev;
            return [...prev, sent];
          });
        };
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      uiSounds.playHoverTick();
    } catch (err) {
      alert('Could not access microphone: ' + err.message);
    }
  };

  const stopAndSendRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
      setIsRecording(false);
      uiSounds.playHoverTick();
    }
  };

  // Sign-in Authentication Handler
  const handleSignIn = (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    const cleanPass = passwordInput.trim().toLowerCase();

    if (selectedUser === 'Bareera') {
      if (cleanPass === 'bunny') {
        setAuthenticatedUser('Bareera');
        localStorage.setItem('bunny_messenger_auth_user', 'Bareera');
        setPasswordInput('');
        uiSounds.playIncomingMsg();
      } else {
        uiSounds.playErrorBeep();
        setAuthError("Incorrect password for Bareera! (Hint: 'bunny')");
      }
    } else if (selectedUser === 'Bhondu') {
      if (cleanPass === 'bhondu') {
        setAuthenticatedUser('Bhondu');
        localStorage.setItem('bunny_messenger_auth_user', 'Bhondu');
        setPasswordInput('');
        uiSounds.playIncomingMsg();
      } else {
        uiSounds.playErrorBeep();
        setAuthError("Incorrect password for Bhondu! (Hint: 'bhondu')");
      }
    }
  };

  const handleSignOut = () => {
    setAuthenticatedUser(null);
    localStorage.removeItem('bunny_messenger_auth_user');
    setPasswordInput('');
    setAuthError('');
    uiSounds.playHoverTick();
  };

  // Load Initial Messages & Subscribe to Realtime Updates when Authenticated
  useEffect(() => {
    if (!authenticatedUser) return;
    let isMounted = true;

    const loadMsgs = async () => {
      const msgs = await messengerDB.fetchMessages();
      if (isMounted && msgs) setMessages(msgs);
    };

    loadMsgs();

    // Subscribe to new incoming messages
    const unsubscribe = messengerDB.subscribeToMessages((newMsg) => {
      if (!isMounted) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // Sound and effect reactions for incoming messages
      if (newMsg.sender !== authenticatedUser) {
        if (newMsg.type === 'nudge') {
          uiSounds.playNudgeSound();
          if (triggerNudgeShake) triggerNudgeShake();
        } else {
          uiSounds.playIncomingMsg();
        }
      }
    });

    // Fallback polling every 3.5 seconds
    const interval = setInterval(async () => {
      const latest = await messengerDB.fetchMessages();
      if (isMounted && latest) {
        setMessages(latest);
      }
    }, 3500);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(interval);
    };
  }, [authenticatedUser]);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleClearChat = async () => {
    await messengerDB.clearAllMessages();
    setMessages([]);
    uiSounds.playHoverTick();
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending || !authenticatedUser) return;

    const textToSend = inputText.trim();
    setInputText('');
    setIsSending(true);

    uiSounds.playOutgoingMsg();

    const sent = await messengerDB.sendMessage({
      sender: authenticatedUser,
      content: textToSend,
      type: 'text'
    });

    setMessages((prev) => {
      if (prev.some((m) => m.id === sent.id)) return prev;
      return [...prev, sent];
    });

    setIsSending(false);
  };

  const handleSendNudge = async () => {
    if (!authenticatedUser) return;
    uiSounds.playNudgeSound();
    if (triggerNudgeShake) triggerNudgeShake();

    const sent = await messengerDB.sendMessage({
      sender: authenticatedUser,
      content: '⚡ SENT A NUDGE! ⚡',
      type: 'nudge'
    });

    setMessages((prev) => {
      if (prev.some((m) => m.id === sent.id)) return prev;
      return [...prev, sent];
    });
  };

  const insertEmoticon = (emo) => {
    setInputText((prev) => prev + (prev ? ' ' : '') + emo);
    uiSounds.playHoverTick();
  };

  // If not authenticated, render Retro MSN Sign-In Page!
  if (!authenticatedUser) {
    return (
      <div className="msn-signin-overlay">
        <div className="msn-signin-box">
          <div className="msn-signin-banner">
            <span className="msn-signin-logo">💬</span>
            <div>
              <div className="msn-signin-title">MSN Messenger 98</div>
              <div className="msn-signin-subtitle">Retro Private Chat Network</div>
            </div>
          </div>

          <form onSubmit={handleSignIn} className="msn-signin-body">
            <div className="msn-signin-label">Select User Account:</div>
            <div className="msn-account-tabs">
              <button
                type="button"
                className={`msn-account-btn ${selectedUser === 'Bareera' ? 'selected' : ''}`}
                onClick={() => { setSelectedUser('Bareera'); setAuthError(''); uiSounds.playHoverTick(); }}
              >
                🌸 Bareera
              </button>
              <button
                type="button"
                className={`msn-account-btn ${selectedUser === 'Bhondu' ? 'selected' : ''}`}
                onClick={() => { setSelectedUser('Bhondu'); setAuthError(''); uiSounds.playHoverTick(); }}
              >
                👤 Bhondu
              </button>
            </div>

            <div className="msn-password-field">
              <label className="msn-signin-label">Password for {selectedUser}:</label>
              <input
                type="password"
                className="msn-password-input"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={selectedUser === 'Bareera' ? 'Password for Bareera...' : 'Password for Bhondu...'}
                autoFocus
              />
            </div>

            {authError && (
              <div className="msn-signin-error">
                <span>⚠️ {authError}</span>
              </div>
            )}

            <button type="submit" className="win98-btn msn-signin-submit">
              Sign In 🔑
            </button>
          </form>
        </div>
      </div>
    );
  }

  const otherRole = authenticatedUser === 'Bhondu' ? 'Bareera' : 'Bhondu';

  return (
    <div className="msn-container">
      {/* Top Retro MSN Header Bar */}
      <div className="msn-header-bar">
        <div className="msn-user-profile">
          <div className={`msn-avatar ${authenticatedUser.toLowerCase()}`}>
            {authenticatedUser === 'Bareera' ? '🌸' : '👤'}
          </div>
          <div className="msn-user-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="msn-username">{authenticatedUser}</span>
              <span className="msn-status-badge">({statusMsg})</span>
            </div>
            <input
              type="text"
              className="msn-status-input"
              value={customStatus}
              onChange={(e) => setCustomStatus(e.target.value)}
              placeholder="Set a status message..."
            />
          </div>
        </div>

        {/* Identity Switcher & Info */}
        <div className="msn-profile-switcher">
          <button
            type="button"
            className="win98-btn"
            style={{ fontSize: '10px', padding: '2px 8px', color: '#0055ea', fontWeight: 'bold' }}
            onClick={handleSignOut}
            title="Sign Out & Switch Account"
          >
            🔑 Sign Out
          </button>
          <button
            type="button"
            className="win98-btn"
            style={{ fontSize: '9px', padding: '1px 5px', color: '#a00' }}
            onClick={handleClearChat}
            title="Clear Chat History"
          >
            🧹 Clear Chat
          </button>
        </div>
      </div>

      {/* Main Chat Thread Log */}
      <div className="msn-chat-log" onWheel={(e) => e.stopPropagation()}>

        <div className="msn-welcome-banner">
          <Sparkles size={14} color="#ff69b4" />
          <span>Instant retro messaging room with <b>{otherRole}</b></span>
        </div>

        {messages.map((msg, idx) => {
          const isMe = msg.sender === authenticatedUser;
          const isNudge = msg.type === 'nudge';

          return (
            <div
              key={msg.id || idx}
              className={`msn-msg-row ${isMe ? 'outgoing' : 'incoming'} ${isNudge ? 'nudge-row' : ''}`}
            >
              <div className="msn-msg-avatar">
                {msg.sender === 'Bareera' ? '🌸' : '👤'}
              </div>
              <div className="msn-msg-bubble">
                <div className="msn-msg-header">
                  <span className="msn-msg-sender">{msg.sender}</span>
                  <span className="msn-msg-time">
                    {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="msn-msg-content">
                  {isNudge ? (
                    <span className="msn-nudge-text">⚡ {msg.sender} JUST SENT A NUDGE! ⚡</span>
                  ) : msg.type === 'audio' ? (
                    <RetroAudioPlayer
                      audioUrl={msg.content}
                      msgId={msg.id || idx}
                      playingAudioId={playingAudioId}
                      setPlayingAudioId={setPlayingAudioId}
                    />
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoticon Toolbar */}
      <div className="msn-emoticon-bar">
        <span style={{ fontSize: '10px', color: '#666', marginRight: '4px' }}>Quick Emojis:</span>
        {['<3', '(•x•)', 'xD', ':_()', ':P', '(✿^‿^)', '💖', '✨', '🧋'].map((emo) => (
          <button
            key={emo}
            type="button"
            className="msn-emo-btn"
            onClick={() => insertEmoticon(emo)}
          >
            {emo}
          </button>
        ))}
      </div>

      {/* Input Box & Action Buttons */}
      <form onSubmit={handleSend} className="msn-input-area">
        {isRecording ? (
          <div className="msn-recording-bar">
            <span>🔴 Recording Voice Note... ({recordingTime}s)</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="win98-btn"
                style={{ fontSize: '10px', color: '#008800', fontWeight: 'bold' }}
                onClick={stopAndSendRecording}
              >
                ✔️ Send Note
              </button>
              <button
                type="button"
                className="win98-btn"
                style={{ fontSize: '10px', color: '#cc0000' }}
                onClick={cancelRecording}
              >
                ✖ Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <input
              type="text"
              className="msn-text-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Type a message to ${otherRole}...`}
            />

            <button
              type="button"
              className="win98-btn msn-voice-btn"
              onClick={startRecording}
              title="Record a retro voice note!"
            >
              🎙️ Mic
            </button>

            <button
              type="button"
              className="win98-btn msn-nudge-btn"
              onClick={handleSendNudge}
              title="Send a screen-shaking nudge!"
            >
              ⚡ NUDGE
            </button>

            <button
              type="submit"
              className="win98-btn msn-send-btn"
              disabled={!inputText.trim() || isSending}
            >
              <Send size={12} /> Send
            </button>
          </>
        )}
      </form>
    </div>
  );
};

// Main BunnyOS 98 Desktop Component
const BunnyOS98 = ({ isOSOpen = true, setIsOSOpen, onEnterMuseum }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isBooting, setIsBooting] = useState(false);
  const [bootText, setBootText] = useState('');
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [isCassetteVisible, setIsCassetteVisible] = useState(false);
  const [isNudgeShaking, setIsNudgeShaking] = useState(false);


  const [activeWallpaper, setActiveWallpaper] = useState(() => localStorage.getItem('bunnyos_wallpaper') || 'bougainvillea');
  const [customWallpaperUrl, setCustomWallpaperUrl] = useState(() => localStorage.getItem('bunnyos_custom_wallpaper_url') || '');
  const [balloonNotification, setBalloonNotification] = useState(null);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState(false);


  const triggerNudgeShake = () => {
    setIsNudgeShaking(true);
    setTimeout(() => setIsNudgeShaking(false), 800);
  };

  const defaultWindows = {
    messenger: { id: 'messenger', title: 'Bunny Messenger 98', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, pos: { x: 120, y: 40 }, size: { w: 480, h: 480 } },
    poetry: { id: 'poetry', title: 'Poetry Vault', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, pos: { x: 100, y: 50 }, size: { w: 560, h: 440 } },
    paint: { id: 'paint', title: 'BunnyPaint', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, pos: { x: 70, y: 50 }, size: { w: 480, h: 360 } },
    racer: { id: 'racer', title: 'Bunny Racer 98', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, pos: { x: 180, y: 50 }, size: { w: 360, h: 520 } },
    heartsweeper: { id: 'heartsweeper', title: 'BunnySweeper 98', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, pos: { x: 160, y: 60 }, size: { w: 300, h: 360 } },
    mail: { id: 'mail', title: 'Bunny Mail 98', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, pos: { x: 140, y: 30 }, size: { w: 560, h: 480 } },
    browser: { id: 'browser', title: 'Bunny Explorer 98 (Internet Explorer)', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, pos: { x: 100, y: 35 }, size: { w: 640, h: 500 } },
    wallpaper: { id: 'wallpaper', title: 'Wallpaper Settings', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, pos: { x: 120, y: 50 }, size: { w: 620, h: 460 } },



    docs: { id: 'docs', title: 'My Documents', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, pos: { x: 100, y: 120 }, size: { w: 380, h: 260 } },
    pictures: { id: 'pictures', title: 'Pictures & Memories', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, pos: { x: 130, y: 70 }, size: { w: 420, h: 320 } },
    camera: { id: 'camera', title: 'Retro Camera 98', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, pos: { x: 150, y: 40 }, size: { w: 520, h: 560 } },
    trash: { id: 'trash', title: 'Recycle Bin', isOpen: false, isMinimized: false, isMaximized: false, zIndex: 1, pos: { x: 180, y: 140 }, size: { w: 320, h: 200 } }
  };

  const [windows, setWindows] = useState(() => {
    try {
      const saved = localStorage.getItem('bunnyos_saved_windows');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.wallpaper && parsed.wallpaper.size && parsed.wallpaper.size.w < 560) {
          parsed.wallpaper.size = { w: 620, h: 460 };
        }
        return { ...defaultWindows, ...parsed };
      }
    } catch (e) {}
    return defaultWindows;
  });


  useEffect(() => {
    try {
      localStorage.setItem('bunnyos_saved_windows', JSON.stringify(windows));
    } catch (e) {}
  }, [windows]);

  // Realtime notification listener
  useEffect(() => {
    const unsubscribe = messengerDB.subscribeToMessages((newMsg) => {
      const currentUser = localStorage.getItem('bunny_messenger_auth_user');
      if (newMsg.sender !== currentUser) {
        uiSounds.playIncomingMsg();
        setBalloonNotification({
          title: '💬 MSN Messenger 98',
          text: `${newMsg.sender}: ${newMsg.type === 'nudge' ? '⚡ SENT A NUDGE!' : newMsg.type === 'audio' ? '🎙️ Sent a voice note' : newMsg.content.slice(0, 35)}`,
          targetApp: 'messenger'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const [topZ, setTopZ] = useState(10);

  const [bootLogs, setBootLogs] = useState([]);

  const triggerBootSequence = async () => {
    setIsBooting(true);
    setBootLogs([]);
    try {
      try { uiSounds.playCinematicWhoosh(); } catch(e){}

      const logs = [
        "BUNNYOS 98 KERNEL v1.98 (x86_64-bunny-linux)",
        "[0.000100] Initializing CPU Core 0... [OK]",
        "[0.002410] Memory Check: 640KB Base / 32MB Extended... [OK]",
        "[0.015200] Loading Kernel Modules: sound_synth.sys, vga_driver.sys... [OK]",
        "[0.038100] Mounting File System: /dev/sda1 (BunnyVault)... [OK]",
        "[0.045000] Initializing ASCII Mascot Engine...",
        "  (\\_/)\n (='.'=)\n (\")_(\")  BunnyOS 98 Graphical Server",
        "[0.072000] Decrypting User Dossier: Bareera... [ACCESS GRANTED]",
        "[0.090000] Launching BunnyOS Desktop Environment...",
        "SYSTEM READY. WELCOME BAREERA."
      ];

      for (let i = 0; i < logs.length; i++) {
        setBootLogs(prev => [...prev, logs[i]]);
        try { uiSounds.playHoverTick(); } catch(e){}
        await new Promise(r => setTimeout(r, 120));
      }

      await new Promise(r => setTimeout(r, 300));
      try { uiSounds.playCinematicWhoosh(); } catch(e){}
    } catch(e) {
      console.warn("Boot sequence warning:", e);
    } finally {
      setIsBooting(false);
    }
  };

  // Custom Event trigger & Global Open Handler
  useEffect(() => {
    const handleCustomOpen = () => {
      uiSounds.init();
      setIsOpen(true);
      triggerBootSequence();
    };

    window.openBunnyOS = handleCustomOpen;
    window.addEventListener('open-bunnyos', handleCustomOpen);

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.altKey) && (e.key === 'b' || e.key === 'B')) {
        handleCustomOpen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('open-bunnyos', handleCustomOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // System Tray Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // Lock body scroll when BunnyOS is open to prevent background page scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Flying Photo animation when snap occurs
  const [flyingPhoto, setFlyingPhoto] = useState(null);
  const [isFolderBouncing, setIsFolderBouncing] = useState(false);
  const picturesIconRef = useRef(null);

  useEffect(() => {
    const handlePhotoCaptured = (e) => {
      const detail = e.detail;
      const photo = detail?.photo || detail;
      const startX = detail?.startX || (window.innerWidth / 2);
      const startY = detail?.startY || (window.innerHeight / 2);

      if (photo && photo.src) {
        let targetX = 80;
        let targetY = 320;
        if (picturesIconRef.current) {
          const rect = picturesIconRef.current.getBoundingClientRect();
          targetX = rect.left + rect.width / 2;
          targetY = rect.top + rect.height / 2;
        }

        setFlyingPhoto({ photo, startX, startY, targetX, targetY });

        setTimeout(() => {
          setIsFolderBouncing(true);
          uiSounds.playSuccessBeep();
        }, 950);

        setTimeout(() => {
          setIsFolderBouncing(false);
        }, 1350);

        setTimeout(() => {
          setFlyingPhoto(null);
        }, 1450);
      }
    };

    window.addEventListener('bunny-photo-captured', handlePhotoCaptured);
    return () => window.removeEventListener('bunny-photo-captured', handlePhotoCaptured);
  }, []);

  const bringToFront = (id) => {
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], zIndex: nextZ, isMinimized: false }
    }));
  };

  const toggleWindow = (id) => {
    uiSounds.playHoverTick();
    setWindows(prev => {
      const win = prev[id];
      if (!win) return prev;
      if (!win.isOpen) {
        const nextZ = topZ + 1;
        setTopZ(nextZ);
        return { ...prev, [id]: { ...win, isOpen: true, isMinimized: false, zIndex: nextZ } };
      } else if (win.isMinimized) {
        const nextZ = topZ + 1;
        setTopZ(nextZ);
        return { ...prev, [id]: { ...win, isMinimized: false, zIndex: nextZ } };
      } else {
        return { ...prev, [id]: { ...win, isMinimized: true } };
      }
    });
  };

  const toggleMaximizeWindow = (id) => {
    uiSounds.playHoverTick();
    setWindows(prev => {
      const win = prev[id];
      if (!win) return prev;
      const nextZ = topZ + 1;
      setTopZ(nextZ);
      return { ...prev, [id]: { ...win, isMaximized: !win.isMaximized, zIndex: nextZ } };
    });
  };

  const onResizeWindow = (id, newSize) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], size: newSize }
    }));
  };

  const closeWindow = (id) => {
    uiSounds.playHoverTick();
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }));
  };

  const closeTopWindow = () => {
    uiSounds.playHoverTick();
    setWindows(prev => {
      const openWins = Object.values(prev).filter(w => w.isOpen && !w.isMinimized);
      if (openWins.length === 0) return prev;
      openWins.sort((a, b) => b.zIndex - a.zIndex);
      const topWin = openWins[0];
      return { ...prev, [topWin.id]: { ...prev[topWin.id], isOpen: false } };
    });
  };

  const closeAllApps = () => {
    uiSounds.playHoverTick();
    setWindows(prev => {
      const updated = {};
      Object.keys(prev).forEach(k => { updated[k] = { ...prev[k], isOpen: false }; });
      return updated;
    });
  };

  const shutdownOS = () => {
    uiSounds.playCinematicWhoosh();
    setIsOpen(false);
    setIsStartOpen(false);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-terminal'));
    }, 300);
  };

  if (!isOpen) return null;


  const floralWallpapers = {
    bougainvillea: '/bougainvillea_wallpaper.jpg',
    sakura: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?q=80&w=1920&auto=format&fit=crop',
    roses: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop'
  };


  const getWallpaperStyle = () => {
    if (activeWallpaper === 'custom' && customWallpaperUrl) {
      return {
        backgroundImage: `url("${customWallpaperUrl}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat'
      };
    } else if (floralWallpapers[activeWallpaper]) {
      return {
        backgroundImage: `url("${floralWallpapers[activeWallpaper]}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return {};
  };

  return (
    <div
      className={`bunnyos-overlay wallpaper-${activeWallpaper} ${isNudgeShaking ? 'nudge-shaking' : ''}`}
      style={getWallpaperStyle()}
    >
      {activeWallpaper === 'matrix' && <MatrixRainCanvas />}
      {activeWallpaper === 'pinkgrid' && <PinkGridBackground />}



      {isBooting ? (
        <div className="terminal-boot-screen">
          <div className="terminal-boot-header">BUNNYOS 98 BOOT CONSOLE // SYSTEM STDIN</div>
          <div className="terminal-boot-log">
            {bootLogs.map((log, idx) => (
              <div key={idx} style={{ marginBottom: '6px', color: log.includes('ACCESS GRANTED') || log.includes('WELCOME') ? '#00ff00' : '#00dd00' }}>
                {log}
              </div>
            ))}
            <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.6 }}>_</motion.span>
          </div>
        </div>
      ) : (
        <div className="android-launcher-container">
          {/* Android Smartphone Top Status Bar */}
          <div className="mobile-phone-status-bar" onClick={() => setIsQuickSettingsOpen(!isQuickSettingsOpen)}>
            <div className="mobile-status-left">
              <span className="mobile-phone-logo">BunnyDroid 💖</span>
            </div>
            <div className="mobile-status-center">
              <span className="mobile-clock">{timeStr}</span>
            </div>
            <div className="mobile-status-right">
              <span className="mobile-stat-icon">📶 5G</span>
              <span className="mobile-stat-icon">🔋 98%</span>
            </div>
          </div>

          {/* Android Notification & Quick Settings Shade */}
          <AnimatePresence>
            {isQuickSettingsOpen && (
              <motion.div
                initial={{ y: '-100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="android-quick-settings-panel"
              >
                <div className="quick-settings-header">
                  <span>Quick Settings & Notifications</span>
                  <button className="win98-btn" onClick={() => setIsQuickSettingsOpen(false)}>✕</button>
                </div>
                <div className="quick-settings-grid">
                  <button className="qs-tile active" onClick={() => uiSounds.playSuccessBeep()}>
                    <span>📶 Wi-Fi</span>
                    <small>Connected (BunnyNet)</small>
                  </button>
                  <button className="qs-tile active" onClick={() => uiSounds.playHoverTick()}>
                    <span>🔊 Sound</span>
                    <small>On (HD Stereo)</small>
                  </button>
                  <button className="qs-tile" onClick={() => { setActiveWallpaper(activeWallpaper === 'pinkgrid' ? 'bougainvillea' : 'pinkgrid'); uiSounds.playHoverTick(); }}>
                    <span>🎨 Theme</span>
                    <small>{activeWallpaper}</small>
                  </button>
                  <button className="qs-tile" onClick={() => { setIsCassetteVisible(!isCassetteVisible); setIsQuickSettingsOpen(false); }}>
                    <span>🎵 Cassette</span>
                    <small>{isCassetteVisible ? 'Visible' : 'Hidden'}</small>
                  </button>
                </div>
                <div className="qs-notification-box">
                  <div className="qs-notif-title">💌 Daily Message for Bareera:</div>
                  <div className="qs-notif-body">"You are the most wonderful part of every day!"</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Android Home Screen Scroll Container */}
          <div className="android-home-screen" onClick={() => { setIsStartOpen(false); setIsQuickSettingsOpen(false); }}>
            
            {/* Hero Clock & Love Widget */}
            <div className="android-hero-widget">
              <div className="widget-clock">{timeStr}</div>
              <div className="widget-date">Sunday, August 9</div>
              <div className="widget-quote">"Bareera's Special Edition OS" 🌸</div>
            </div>

            {/* Compact Music Cassette Widget */}
            <div className="android-music-widget" onClick={() => setIsCassetteVisible(!isCassetteVisible)}>
              <Music size={18} color="#ff1493" />
              <div className="music-widget-info">
                <span className="track-name">Retro Audio Player</span>
                <span className="artist-name">Tap to toggle Tape Stereo 🎶</span>
              </div>
            </div>

            {/* Android 4-Column Squircle App Grid */}
            <div className="android-app-grid">
              <div className="android-app-tile" onClick={() => toggleWindow('messenger')}>
                <div className="app-icon-squircle msn-bg">
                  <MessageSquare size={28} color="#ffffff" />
                </div>
                <span className="app-label">Messenger</span>
              </div>

              <div className="android-app-tile" onClick={() => toggleWindow('camera')}>
                <div className="app-icon-squircle cam-bg">
                  <Camera size={28} color="#ffffff" />
                </div>
                <span className="app-label">Retro Cam</span>
              </div>

              <div className="android-app-tile" onClick={() => toggleWindow('poetry')}>
                <div className="app-icon-squircle poetry-bg">
                  <Lock size={28} color="#ffffff" />
                </div>
                <span className="app-label">Poetry</span>
              </div>

              <motion.div
                ref={picturesIconRef}
                className="android-app-tile"
                onClick={() => toggleWindow('pictures')}
                animate={isFolderBouncing ? { scale: [1, 1.35, 0.9, 1], rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <div className="app-icon-squircle gallery-bg">
                  <Image size={28} color="#ffffff" />
                </div>
                <span className="app-label">Gallery</span>
              </motion.div>

              <div className="android-app-tile" onClick={() => toggleWindow('mail')}>
                <div className="app-icon-squircle mail-bg">
                  <Mail size={28} color="#ffffff" />
                </div>
                <span className="app-label">Mail</span>
              </div>

              <div className="android-app-tile" onClick={() => toggleWindow('paint')}>
                <div className="app-icon-squircle paint-bg">
                  <Palette size={28} color="#ffffff" />
                </div>
                <span className="app-label">Paint</span>
              </div>

              <div className="android-app-tile" onClick={() => toggleWindow('racer')}>
                <div className="app-icon-squircle racer-bg">
                  <Gamepad2 size={28} color="#ffffff" />
                </div>
                <span className="app-label">Racer</span>
              </div>

              <div className="android-app-tile" onClick={() => toggleWindow('heartsweeper')}>
                <div className="app-icon-squircle sweeper-bg">
                  <span style={{ fontSize: '24px' }}>🐰</span>
                </div>
                <span className="app-label">Sweeper</span>
              </div>

              <div className="android-app-tile" onClick={() => toggleWindow('wallpaper')}>
                <div className="app-icon-squircle settings-bg">
                  <Settings size={28} color="#ffffff" />
                </div>
                <span className="app-label">Settings</span>
              </div>

              <div className="android-app-tile" onClick={() => toggleWindow('docs')}>
                <div className="app-icon-squircle docs-bg">
                  <Folder size={28} color="#ffffff" />
                </div>
                <span className="app-label">Documents</span>
              </div>

              <div className="android-app-tile" onClick={onEnterMuseum}>
                <div className="app-icon-squircle museum-bg">
                  <Sparkles size={28} color="#ffffff" />
                </div>
                <span className="app-label">3D Museum</span>
              </div>

              <div className="android-app-tile" onClick={() => toggleWindow('trash')}>
                <div className="app-icon-squircle trash-bg">
                  <Trash2 size={28} color="#ffffff" />
                </div>
                <span className="app-label">Recycle Bin</span>
              </div>
            </div>
          </div>

          {/* Android Bottom Fixed Glass Phone Dock */}
          <div className="mobile-bottom-phone-dock">
            <div className="mobile-dock-icon msn-bg" onClick={() => toggleWindow('messenger')}>
              <MessageSquare size={22} color="#ffffff" />
              <span>MSN</span>
            </div>
            <div className="mobile-dock-icon cam-bg" onClick={() => toggleWindow('camera')}>
              <Camera size={22} color="#ffffff" />
              <span>Cam</span>
            </div>
            <div className="mobile-dock-icon poetry-bg" onClick={() => toggleWindow('poetry')}>
              <Lock size={22} color="#ffffff" />
              <span>Poetry</span>
            </div>
            <div className="mobile-dock-icon mail-bg" onClick={() => toggleWindow('mail')}>
              <Mail size={22} color="#ffffff" />
              <span>Mail</span>
            </div>
          </div>

          {/* Android Gesture Home Bar (Bottom Pill) */}
          <div className="android-gesture-home-bar" onClick={() => {
            // Close all open windows and return home
            setWindows(prev => {
              const updated = {};
              Object.keys(prev).forEach(k => { updated[k] = { ...prev[k], isOpen: false }; });
              return updated;
            });
            uiSounds.playHoverTick();
          }}>
            <div className="gesture-pill" />
          </div>



          {/* Flying Polaroid Animation to Pictures Folder */}
          <AnimatePresence>
            {flyingPhoto && (
              <motion.div
                initial={{
                  position: 'fixed',
                  top: `${flyingPhoto.startY}px`,
                  left: `${flyingPhoto.startX}px`,
                  x: '-50%',
                  y: '-50%',
                  scale: 1,
                  opacity: 1,
                  rotate: -3,
                  zIndex: 999999
                }}
                animate={{
                  top: `${flyingPhoto.targetY}px`,
                  left: `${flyingPhoto.targetX}px`,
                  x: '-50%',
                  y: '-50%',
                  scale: 0.12,
                  opacity: 0,
                  rotate: 360
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.15, ease: [0.25, 0.8, 0.25, 1] }}
                style={{
                  width: '150px',
                  padding: '8px 8px 18px 8px',
                  background: '#ffffff',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{ width: '100%', height: '110px', overflow: 'hidden', background: '#000', borderRadius: '2px', marginBottom: '6px' }}>
                  <img
                    src={flyingPhoto.photo.src}
                    alt={flyingPhoto.photo.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated' }}
                  />
                </div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace', color: '#222', textAlign: 'center' }}>
                  {flyingPhoto.photo.title}
                </span>
                <span style={{ fontSize: '9px', fontWeight: 'bold', fontFamily: 'monospace', color: '#ff1493', marginTop: '2px', textAlign: 'center' }}>
                  Saved to Pictures! 💖
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Render Active Windows */}
          {Object.values(windows).map((win) => {
            if (!win.isOpen || win.isMinimized) return null;

            return (
              <Win98WindowItem
                key={win.id}
                win={win}
                bringToFront={bringToFront}
                toggleWindow={toggleWindow}
                toggleMaximizeWindow={toggleMaximizeWindow}
                closeWindow={closeWindow}
                onResizeWindow={onResizeWindow}
              >
                {win.id === 'messenger' && <BunnyMessengerApp triggerNudgeShake={triggerNudgeShake} />}
                {win.id === 'poetry' && <PoetryVaultApp />}
                {win.id === 'paint' && <BunnyPaintApp />}
                {win.id === 'racer' && <BunnyRacerApp />}
                {win.id === 'heartsweeper' && <BunnySweeperApp />}
                {win.id === 'mail' && <BunnyMailApp />}
                {win.id === 'wallpaper' && (
                  <WallpaperPickerApp
                    activeWallpaper={activeWallpaper}
                    setActiveWallpaper={setActiveWallpaper}
                    customWallpaperUrl={customWallpaperUrl}
                    setCustomWallpaperUrl={setCustomWallpaperUrl}
                  />
                )}


                {win.id === 'pictures' && <PicturesApp />}
                {win.id === 'camera' && <RetroCameraApp />}
                {win.id === 'docs' && (
                  <div style={{ background: '#fff', border: '1px inset #707070', padding: '12px', height: '100%', fontSize: '12px', fontFamily: 'monospace' }}>
                    <p style={{ fontWeight: 'bold', color: '#ff1493' }}>📁 TOP SECRET VAULT DOSSIER</p>
                    <p style={{ marginTop: '8px', lineHeight: '1.5' }}>
                      Target: Bareera<br/>
                      Clearance: MAXIMUM (Level 10)<br/>
                      Attributes: Exceptionally brilliant, kind-hearted, and irreplaceable.<br/><br/>
                      Note: Every pixel in this system was built to brighten your day!
                    </p>
                  </div>
                )}
                {win.id === 'trash' && (
                  <div style={{ background: '#fff', border: '1px inset #707070', padding: '12px', height: '100%', fontSize: '12px', textAlign: 'center', color: '#888' }}>
                    <p>Recycle Bin is empty.</p>
                    <p style={{ fontSize: '11px', marginTop: '6px', color: '#ff69b4' }}>No good memories are ever deleted here! 💖</p>
                  </div>
                )}
              </Win98WindowItem>
            );
          })}

          {/* Start Menu Popup */}
          <AnimatePresence>
            {isStartOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="start-menu"
              >
                <div className="start-menu-banner">BUNNYOS 98</div>
                <div className="start-menu-items">
                  <div className="start-menu-item" onClick={() => { toggleWindow('messenger'); setIsStartOpen(false); }}>
                    <MessageSquare size={16} color="#00a8ff" /> Bunny Messenger 98
                  </div>
                  <div className="start-menu-item" onClick={() => { toggleWindow('poetry'); setIsStartOpen(false); }}>
                    <Lock size={16} color="#ff1493" /> Poetry Vault
                  </div>
                  <div className="start-menu-item" onClick={() => { toggleWindow('paint'); setIsStartOpen(false); }}>
                    <Palette size={16} /> BunnyPaint
                  </div>
                  <div className="start-menu-item" onClick={() => { toggleWindow('racer'); setIsStartOpen(false); }}>
                    <Gamepad2 size={16} /> Bunny Racer
                  </div>
                  <div className="start-menu-item" onClick={() => { toggleWindow('heartsweeper'); setIsStartOpen(false); }}>
                    <span style={{ fontSize: '14px' }}>🐰</span> BunnySweeper 98
                  </div>
                  <div className="start-menu-item" onClick={() => { toggleWindow('mail'); setIsStartOpen(false); }}>
                    <Mail size={16} color="#ff1493" /> Bunny Mail 98
                  </div>


                  <div className="start-menu-item" onClick={() => { toggleWindow('wallpaper'); setIsStartOpen(false); }}>
                    <Settings size={16} color="#00ffcc" /> Wallpaper Settings
                  </div>
                  <div className="start-menu-item" onClick={() => { toggleWindow('pictures'); setIsStartOpen(false); }}>
                    <Image size={16} /> Pictures
                  </div>
                  <div className="start-menu-item" onClick={() => { toggleWindow('camera'); setIsStartOpen(false); }}>
                    <Camera size={16} color="#ff1493" /> Retro Camera
                  </div>
                  <div className="start-menu-item" onClick={() => { toggleWindow('docs'); setIsStartOpen(false); }}>
                    <Folder size={16} /> My Documents
                  </div>
                  <div className="start-menu-divider" />
                  <div className="start-menu-item" onClick={shutdownOS}>
                    <Power size={16} color="red" /> Shutdown BunnyOS
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop Cassette Widget */}
          <CassetteWidget
            isVisible={isCassetteVisible}
            onClose={() => setIsCassetteVisible(false)}
          />

          {/* Win98 Taskbar */}
          <div className="win98-taskbar">
            <button
              className={`start-btn ${isStartOpen ? 'active' : ''}`}
              onClick={() => setIsStartOpen(!isStartOpen)}
            >
              <Heart size={14} fill="#ff69b4" color="#ff69b4" />
              <span>Start</span>
            </button>

            <div className="taskbar-apps">
              {Object.values(windows).map((win) => {
                if (!win.isOpen) return null;
                return (
                  <button
                    key={win.id}
                    className={`taskbar-item ${!win.isMinimized ? 'active' : ''}`}
                    onClick={() => toggleWindow(win.id)}
                  >
                    <span>{win.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="system-tray" style={{ position: 'relative' }}>
              <button
                className="win98-btn"
                style={{ width: 'auto', padding: '2px 5px', height: '22px', display: 'flex', alignItems: 'center', gap: '3px' }}
                onClick={() => setIsCassetteVisible(!isCassetteVisible)}
                title="Toggle Cassette Stereo Player"
              >
                <Music size={12} color="#ff1493" /> Tape
              </button>
              <span>{timeStr}</span>

              {/* System Tray Win98 Notification Balloon */}
              {balloonNotification && (
                <div
                  className="win98-balloon-notification"
                  onClick={() => {
                    toggleWindow(balloonNotification.targetApp || 'messenger');
                    setBalloonNotification(null);
                  }}
                >
                  <div className="win98-balloon-header">
                    <span>{balloonNotification.title}</span>
                    <button
                      type="button"
                      className="win98-balloon-close"
                      onClick={(e) => { e.stopPropagation(); setBalloonNotification(null); }}
                    >
                      ×
                    </button>
                  </div>
                  <div className="win98-balloon-body">{balloonNotification.text}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Android System Bottom 3-Button Navigation Bar (Always Visible On Top) */}
      <div className="android-system-nav-bar">
        <button
          type="button"
          className="android-nav-btn"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); closeTopWindow(); }}
          onClick={(e) => { e.stopPropagation(); closeTopWindow(); }}
          title="Back (Close active app)"
        >
          ◀
        </button>

        <button
          type="button"
          className="android-nav-btn home-pill-btn"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); closeAllApps(); }}
          onClick={(e) => { e.stopPropagation(); closeAllApps(); }}
          title="Home (Close all apps & return home)"
        >
          ●
        </button>

        <button
          type="button"
          className="android-nav-btn"
          onPointerDown={(e) => e.stopPropagation()}
          onTouchEnd={(e) => { e.stopPropagation(); e.preventDefault(); closeAllApps(); }}
          onClick={(e) => { e.stopPropagation(); closeAllApps(); }}
          title="Close All Apps"
        >
          ■
        </button>
      </div>
    </div>
  );
};

export default BunnyOS98;

