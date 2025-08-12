import React, { useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';

export default function WhatsInTheBox(){
  const [choice,setChoice] = useState(1);
  const [status,setStatus] = useState('');
  const [err,setErr] = useState('');
  const audioRef = useRef(null);

  useEffect(()=>{ audioRef.current?.play().catch(()=>{}); },[]);

  async function onSubmit(e){
    e.preventDefault(); setErr(''); setStatus('Checking…');
    try{
      const r = await api.post('/api/games/whats-in-the-box/pick',{ box: choice });
      if(r.result==='win') setStatus('🎉 You picked the prize!');
      else if(r.result==='lose') setStatus('Not this time. Try again!');
      else setStatus(JSON.stringify(r));
    }catch(ex){ setErr(ex.message||'Error'); }
  }

  return (
    <div className="neon-wrap">
      <div className="neon-grid" style={{maxWidth:720}}>
        <GlassCard tone="game" title="WHAT’S IN THE BOX" subtitle="Live">
          <audio ref={audioRef} src="/audio/whats-in-the-box-intro-enGB-announcer-v1.mp3" preload="none"/>
          {status && <div className="info">{status}</div>}
          {err && <div className="bad">{err}</div>}
          <form onSubmit={onSubmit} style={{display:'grid',gap:12}}>
            <div style={{display:'grid',gap:10,gridTemplateColumns:'repeat(5,1fr)'}}>
              {[1,2,3,4,5].map(n=>(
                <button key={n} type="button"
                        onClick={()=>setChoice(n)}
                        className={n===choice?'btn':'btn ghost'}>
                  {n}
                </button>
              ))}
            </div>
            <NeonButton type="submit">Open</NeonButton>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}