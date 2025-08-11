import React, { useState } from 'react';
import { api } from '../../lib/api';

// Public page: anyone can guess the 3-digit code (no login)
export default function CrackSafePublic() {
  const [guess, setGuess] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function submitGuess(e) {
    e.preventDefault();
    setError('');
    setStatus('Checking…');
    try {
      const res = await api.post('/api/games/crack-the-safe/guess', { guess });
      if (res.result === 'correct') setStatus('🎉 Correct! The safe is cracked!');
      else if (res.result === 'higher') setStatus('🔺 Higher');
      else if (res.result === 'lower') setStatus('🔻 Lower');
      else setStatus(JSON.stringify(res));
    } catch (e2) {
      setError(e2.message || 'Error');
      setStatus('');
    }
  }

  return (
    <div style={s.wrap}>
      <main style={s.main}>
        <h1 style={{marginTop:0}}>Crack the Safe</h1>
        <p>Enter a 3-digit code.</p>
        <form onSubmit={submitGuess} style={s.card}>
          <input
            style={s.input}
            value={guess}
            onChange={(e) => setGuess(e.target.value.replace(/\D/g, '').slice(0, 3))}
            placeholder="000–999"
            inputMode="numeric"
            pattern="\d{3}"
            required
          />
          <button style={s.btn} type="submit">Guess</button>
          {status && <div style={s.info}>{status}</div>}
          {error && <div style={s.err}>{error}</div>}
        </form>
        <p style={s.small}>Powered by Pub Game</p>
      </main>
    </div>
  );
}

const s = {
  wrap:{minHeight:'100vh',background:'#0f172a',color:'#fff',display:'grid',placeItems:'center'},
  main:{padding:20,maxWidth:480,width:'100%'},
  card:{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:12,padding:16,display:'grid',gap:10},
  input:{padding:'10px 12px',borderRadius:10,border:'1px solid rgba(255,255,255,0.18)',background:'rgba(15,23,42,0.8)',color:'#fff',width:140},
  btn:{padding:'10px 14px',borderRadius:10,border:0,background:'#22c55e',color:'#0f172a',fontWeight:800,width:140,cursor:'pointer'},
  info:{marginTop:6,color:'#bfdbfe'}, err:{marginTop:6,color:'#fecaca'}, small:{color:'#94a3b8',fontSize:12,textAlign:'center',marginTop:12}
};