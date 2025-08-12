import React, { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';

export default function CrackTheSafe(){
  const [guess,setGuess] = useState('');
  const [status,setStatus] = useState('');
  const [err,setErr] = useState('');
  const audioRef = useRef(null);

  useEffect(()=>{ audioRef.current?.play().catch(()=>{}); },[]);

  async function onSubmit(e){
    e.preventDefault(); setErr(''); setStatus('Checking…');
    try{
      const r = await api.post('/api/games/crack-the-safe/guess',{ guess });
      if(r.result==='correct') setStatus('🎉 Correct! You cracked the safe!');
      else if(r.result==='incorrect') setStatus('Nope! Try again.');
      else setStatus(JSON.stringify(r));
    }catch(ex){ setErr(ex.message||'Error'); }
  }

  return (
    <div className="neon-wrap">
      <div className="neon-grid" style={{maxWidth:680}}>
        <GlassCard tone="game" title="CRACK THE SAFE" subtitle="Live">
          <audio ref={audioRef} src="/audio/crack-safe-intro-enGB-announcer-v1.mp3" preload="none"/>
          {status && <div className="info">{status}</div>}
          {err && <div className="bad">{err}</div>}
          <form onSubmit={onSubmit} style={{display:'grid',gap:10}}>
            <input className="input" inputMode="numeric" maxLength={3} placeholder="000–999"
                   value={guess} onChange={(e)=>setGuess(e.target.value)} />
            <NeonButton type="submit">Submit Guess</NeonButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}