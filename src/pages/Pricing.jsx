import React from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';

export default function Pricing(){
  const navigate = useNavigate();

  return (
    <div className="neon-wrap">
      <div className="neon-grid" style={{maxWidth:900}}>
        <GlassCard tone="newgame" title="PRICING">
          <p>Configure entry prices in admin/Stripe. (UI coming soon.)</p>
          <div style={{display:'flex',gap:10}}>
            <NeonButton onClick={() => navigate(-1)}>Back</NeonButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}