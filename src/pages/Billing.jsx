import React from 'react';
import GlassCard from '../components/GlassCard';
import NeonButton from '../components/NeonButton';

export default function Billing(){
  return (
    <div className="neon-wrap">
      <div className="neon-grid" style={{maxWidth:900}}>
        <GlassCard tone="dashboard" title="BILLING">
          <p>Open customer portal to manage subscription.</p>
          <NeonButton onClick={()=>location.assign('/api/billing/portal')}>Open Portal</NeonButton>
        </GlassCard>
      </div>
    </div>
  );
}