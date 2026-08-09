import React, { useState, useEffect, useRef } from 'react';
import { Camera, Zap, RefreshCw, Sparkles, Image as ImageIcon, Sliders } from 'lucide-react';
import { uiSounds } from '../utils/UISounds';
import { picturesDBService } from '../utils/PicturesDBService';
import './RetroCameraApp.css';

const RETRO_FILTERS = [
  { id: 'digicam', name: '90s Digicam', filterStyle: 'contrast(115%) brightness(105%) saturate(85%) sepia(20%)' },
  { id: 'gameboy', name: '8-Bit GameBoy', filterStyle: 'grayscale(100%) sepia(100%) hue-rotate(50deg) saturate(300%) contrast(150%)' },
  { id: 'vhs', name: 'VHS Synth', filterStyle: 'hue-rotate(280deg) saturate(160%) contrast(130%)' },
  { id: 'polaroid', name: 'Warm Polaroid', filterStyle: 'contrast(90%) brightness(110%) sepia(35%) saturate(120%)' },
  { id: 'sepia', name: '1998 Sepia', filterStyle: 'sepia(80%) contrast(120%) brightness(95%)' }
];

const RetroCameraApp = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraState, setCameraState] = useState('initializing'); // initializing, active, error
  const [selectedFilter, setSelectedFilter] = useState('digicam');
  const [isFlashOn, setIsFlashOn] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isEjecting, setIsEjecting] = useState(false);
  const [resolution, setResolution] = useState('low'); // 'low' = 320x240, 'retro' = 240x180

  // Format date stamp like '98 08 03
  const getRetroTimestamp = () => {
    const now = new Date();
    const yr = String(now.getFullYear()).slice(-2);
    const mo = String(now.getMonth() + 1).padStart(2, '0');
    const da = String(now.getDate()).padStart(2, '0');
    const hr = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    return `'${yr} ${mo} ${da}  ${hr}:${mi}`;
  };

  // Start webcam
  const startWebcam = async () => {
    setCameraState('initializing');
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraState('active');
    } catch (err) {
      console.warn('Webcam permission denied or unavailable:', err);
      setCameraState('error');
    }
  };

  useEffect(() => {
    startWebcam();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Draw simulated retro test pattern if webcam error
  useEffect(() => {
    if (cameraState !== 'error') return;

    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const drawTestPattern = () => {
      const w = canvas.width || 320;
      const h = canvas.height || 240;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      // Bars
      const colors = ['#ffffff', '#ffff00', '#00ffff', '#00ff00', '#ff00ff', '#ff0000', '#0000ff'];
      const barWidth = w / colors.length;
      colors.forEach((col, idx) => {
        ctx.fillStyle = col;
        ctx.fillRect(idx * barWidth, 0, barWidth, h * 0.75);
      });

      // Bottom retro noise
      ctx.fillStyle = '#111';
      ctx.fillRect(0, h * 0.75, w, h * 0.25);

      // Noise generator
      const imgData = ctx.getImageData(0, h * 0.75, w, h * 0.25);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const grain = Math.floor(Math.random() * 80);
        data[i] = grain;
        data[i + 1] = grain;
        data[i + 2] = grain;
      }
      ctx.putImageData(imgData, 0, h * 0.75);

      // Text overlay
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NO CAM SIGNAL - BUNNY 98', w / 2, h * 0.88);

      animId = requestAnimationFrame(drawTestPattern);
    };

    drawTestPattern();
    return () => cancelAnimationFrame(animId);
  }, [cameraState]);

  const snapPicture = () => {
    uiSounds.playHoverTick();

    if (isFlashOn) {
      uiSounds.playFlashWhine();
      setIsFlashing(true);
      setTimeout(() => {
        setIsFlashing(false);
      }, 250);
    }

    setTimeout(() => {
      uiSounds.playCameraShutter();

      const captureCanvas = document.createElement('canvas');
      // Low quality pixelated resolution: 320x240 or 240x180
      const targetW = resolution === 'retro' ? 240 : 320;
      const targetH = resolution === 'retro' ? 180 : 240;

      captureCanvas.width = targetW;
      captureCanvas.height = targetH;
      const ctx = captureCanvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;

      // Filter settings
      const currentFilterObj = RETRO_FILTERS.find(f => f.id === selectedFilter) || RETRO_FILTERS[0];
      ctx.filter = currentFilterObj.filterStyle;

      if (cameraState === 'active' && videoRef.current) {
        // Draw video feed low-res
        ctx.drawImage(videoRef.current, 0, 0, targetW, targetH);
      } else {
        // Draw canvas test card
        if (canvasRef.current) {
          ctx.drawImage(canvasRef.current, 0, 0, targetW, targetH);
        }
      }

      // Add low-res 90s digital camera grain overlay
      const imgData = ctx.getImageData(0, 0, targetW, targetH);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 22; // grainy sensor noise
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);

      // Draw Retro Date Timestamp in corner
      if (showTimestamp) {
        const stampText = getRetroTimestamp();
        ctx.font = 'bold 13px "Courier New", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        // Shadow/Glow
        ctx.fillStyle = '#000000';
        ctx.fillText(stampText, targetW - 9, targetH - 9);
        ctx.fillStyle = '#ffb700'; // Amber LCD digicam timestamp
        ctx.fillText(stampText, targetW - 10, targetH - 10);
      }

      const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.85);

      // Create photo object
      const newPhoto = {
        id: 'photo_' + Date.now(),
        name: `retro_cam_${Date.now().toString().slice(-4)}.jpg`,
        title: `Retro Snap ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        src: dataUrl,
        date: new Date().toLocaleDateString(),
        filter: currentFilterObj.name,
        isUserCaptured: true
      };

      setCapturedPhoto(newPhoto);
      setIsEjecting(true);

      // Calculate camera body eject position for smooth flight animation
      const bodyEl = document.querySelector('.retro-camera-body');
      let startX = window.innerWidth / 2;
      let startY = window.innerHeight / 2;
      if (bodyEl) {
        const rect = bodyEl.getBoundingClientRect();
        startX = rect.left + rect.width / 2;
        startY = rect.bottom - 40;
      }

      // Save to Supabase + localStorage
      try {
        picturesDBService.savePhoto(newPhoto);
        window.dispatchEvent(new CustomEvent('bunny-photo-captured', { 
          detail: { photo: newPhoto, startX, startY } 
        }));
      } catch (e) {
        console.error('Failed to save captured photo:', e);
      }

      setTimeout(() => {
        setIsEjecting(false);
      }, 2000);
    }, isFlashOn ? 200 : 50);
  };

  return (
    <div className="retro-camera-container">
      {/* Flash overlay */}
      {isFlashing && <div className="camera-flash-overlay" />}

      {/* Main Camera Outer Frame */}
      <div className="retro-camera-body">
        {/* Top Controls Bar */}
        <div className="camera-top-bar">
          <div className="camera-brand">
            <span className="brand-logo">BUNNY</span>
            <span className="brand-model">CAM-98</span>
            <span className="brand-sub">DIGITAL 0.3MP</span>
          </div>

          <div className="camera-leds">
            <div className={`led-item ${cameraState === 'active' ? 'on-green' : 'on-red'}`}>
              <span className="led-light" /> PWR
            </div>
            <div className={`led-item ${isFlashOn ? 'on-yellow' : ''}`}>
              <span className="led-light" /> FLASH
            </div>
          </div>
        </div>

        {/* Viewfinder Window Frame */}
        <div className="camera-viewfinder-wrapper">
          <div className="viewfinder-glass" onClick={snapPicture} style={{ cursor: 'pointer' }} title="Click screen or SNAP button to take photo!">
            {/* Real Video or Test Canvas */}
            {cameraState === 'active' ? (
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el && stream && el.srcObject !== stream) {
                    el.srcObject = stream;
                  }
                }}
                autoPlay
                playsInline
                muted
                className="viewfinder-video"
                style={{
                  filter: RETRO_FILTERS.find(f => f.id === selectedFilter)?.filterStyle,
                  imageRendering: 'pixelated'
                }}
              />
            ) : (
              <canvas
                ref={canvasRef}
                width={320}
                height={240}
                className="viewfinder-canvas"
                style={{
                  filter: RETRO_FILTERS.find(f => f.id === selectedFilter)?.filterStyle,
                  imageRendering: 'pixelated'
                }}
              />
            )}

            {/* Viewfinder Overlay HUD */}
            <div className="viewfinder-hud">
              <div className="hud-corner top-left">REC [0.3MP]</div>
              <div className="hud-corner top-right">🔋 98%</div>
              <div className="hud-crosshair">+</div>
              <div className="hud-corner bottom-left">
                {showTimestamp && getRetroTimestamp()}
              </div>
              <div className="hud-corner bottom-right">
                {RETRO_FILTERS.find(f => f.id === selectedFilter)?.name.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Control Deck */}
        <div className="camera-deck">
          {/* Filter selection buttons */}
          <div className="filter-selector">
            <span className="deck-label"><Sliders size={11} /> RETRO MODE:</span>
            <div className="filter-buttons">
              {RETRO_FILTERS.map(f => (
                <button
                  key={f.id}
                  className={`win98-btn filter-btn ${selectedFilter === f.id ? 'active-filter' : ''}`}
                  onClick={() => { uiSounds.playHoverTick(); setSelectedFilter(f.id); }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="camera-actions-row">
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                className={`win98-btn ${isFlashOn ? 'active-flash' : ''}`}
                style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                onClick={() => { uiSounds.playHoverTick(); setIsFlashOn(!isFlashOn); }}
              >
                <Zap size={13} color={isFlashOn ? '#ffd700' : '#888'} />
                Flash: {isFlashOn ? 'ON' : 'OFF'}
              </button>

              <button
                className="win98-btn"
                style={{ padding: '3px 8px', fontSize: '11px' }}
                onClick={() => { uiSounds.playHoverTick(); setResolution(resolution === 'low' ? 'retro' : 'low'); }}
              >
                Quality: {resolution === 'retro' ? '240x180 (Ultra Low)' : '320x240 (Low)'}
              </button>

              {cameraState === 'error' && (
                <button
                  className="win98-btn"
                  style={{ padding: '3px 6px', fontSize: '11px' }}
                  onClick={startWebcam}
                  title="Retry camera connection"
                >
                  <RefreshCw size={12} /> Retry Cam
                </button>
              )}
            </div>

            {/* Main Mechanical Shutter Button */}
            <button
              className="shutter-button"
              onClick={snapPicture}
              title="Click to take low-res retro photo!"
            >
              <div className="shutter-inner">
                <Camera size={20} color="#fff" />
                <span>SNAP</span>
              </div>
            </button>
          </div>
        </div>

        {/* Ejected Photo Tray Animation */}
        {isEjecting && capturedPhoto && (
          <div className="ejected-photo-tray">
            <div className="polaroid-frame">
              <img src={capturedPhoto.src} alt={capturedPhoto.title} />
              <div className="polaroid-caption">
                <span>{capturedPhoto.title}</span>
                <span className="saved-tag">Saved to Pictures! 💖</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetroCameraApp;
