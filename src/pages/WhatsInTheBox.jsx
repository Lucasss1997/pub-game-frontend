import React, { useState } from 'react';
import '../ui/pubgame-theme.css';

export default function WhatsInTheBox() {
  const [guess, setGuess] = useState('');
  const [message, setMessage] = useState('');
  const ANSWER = 'gold'; // Demo only — in real game this comes from backend

  const checkGuess = () => {
    if (guess.toLowerCase() === ANSWER) {
      setMessage('🎉 Correct! You found what’s in the box!');
    } else {
      setMessage('❌ Wrong guess!');
    }
  };

  return (
    <div className="neon-wrap">
      <h2>What’s in the Box?</h2>
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
      />
      <button className="btn" onClick={checkGuess}>Guess</button>
      {message && <p className="result">{message}</p>}
    </div>
  );
}