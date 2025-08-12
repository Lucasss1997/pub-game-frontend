import React from 'react';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';

export default function Pricing(){
  return (
    <div className="neon-wrap">
      <div className="neon-grid" style={{maxWidth:900}}>
        <GlassCard tone="newgame" title="PRICING">
          <p>Configure entry prices in admin/Stripe. (UI coming soon.)</p>
          <NeonButton onClick={()=>history.back()}>Back</NeonButton>
        </GlassCard>
      </div>
    </div>
  );
}