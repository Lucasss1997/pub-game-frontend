import React from 'react';
import GlassCard from '../components/GlassCard';

export default function Raffle(){
  return (
    <div className="neon-wrap">
      <div className="neon-grid" style={{maxWidth:900}}>
        <GlassCard tone="dashboard" title="RAFFLE">
          <p>Paid entrants will appear here. (Hook to your /api/raffle/list endpoint.)</p>
        </GlassCard>
      </div>
    </div>
  );
}