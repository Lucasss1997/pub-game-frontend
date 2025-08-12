import React, { useState } from 'react';
import '../ui/pubgame-theme.css';

export default function CrackTheSafe() {
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const SAFE_CODE = '1234'; // Demo only — in real game this comes from backend

  const checkGuess = () => {
    if (guess === SAFE_CODE) {
      setMessage('🎉 Correct! You cracked the safe!');
    } else {
      setMessage('❌ Wrong code!');
    }
  };

  return (
    <div className="neon-wrap">
      <h2>Crack the Safe</h2>
      <p>Enter the code to open the safe!</p>
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        maxLength={4}
      />
      <button className="btn" onClick={checkGuess}>Try</button>
      {message && <p className="result">{message}</p>}
    </div>
  );
}