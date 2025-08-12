import React, { useEffect, useRef, useState } from 'react';

export default function IntroVideoModal({
  open,
  onClose,
  src,         // MP4 URL
  poster,      // optional image
  title = 'Get Ready',
  cta = 'Start',
  autoCloseAt = 0, // seconds; 0 = don’t auto-close
}) {
  const videoRef = useRef(null);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    if (!open) return;
    // Try to autoplay muted on mobile
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const p = v.play();
    if (p && p.catch) p.catch(() => {/* ignore autoplay rejection */});
  }, [open]);

  useEffect(() => {
    if (!open || !autoCloseAt) return;
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (v.currentTime >= autoCloseAt) onClose?.();
    };
    v?.addEventListener('timeupdate', onTime);
    return () => v?.removeEventListener('timeupdate', onTime);
  }, [open, autoCloseAt, onClose]);

  if (!open) return null;

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2 style={{ margin: '0 0 8px 0' }}>{title}</h2>
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
          <video
            ref={videoRef}
            src={src}
            poster={poster}
            playsInline
            muted
            controls={canPlay}
            onCanPlay={() => setCanPlay(true)}
            style={{ width: '100%', height: 'auto', display: 'block', background: '#000' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={onClose} style={btnSecondary}>Skip</button>
          <button onClick={onClose} style={btnPrimary}>{cta}</button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
  display: 'grid', placeItems: 'center', zIndex: 50,
};

const modal = {
  width: 'min(720px, 92vw)', background: 'rgba(15,23,42,0.95)',
  color: '#e5e7eb', borderRadius: 16, padding: 16,
  border: '1px solid rgba(255,255,255,0.12)',
  boxShadow: '0 10px 25px rgba(0,0,0,0.45)',
  fontFamily: 'system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif'
};

const btnPrimary = {
  padding: '10px 14px', borderRadius: 10, border: 'none',
  background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#0b1220',
  fontWeight: 800, cursor: 'pointer'
};
const btnSecondary = {
  padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.22)',
  background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', cursor: 'pointer'
};