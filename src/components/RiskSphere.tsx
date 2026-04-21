import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const RiskSphere = ({ riskScore }: { riskScore: number }) => {
  // Professional color mapping
  const getRiskStyles = (score: number) => {
    if (score < 30) return { color: "text-emerald-500", border: "border-emerald-500/20", bg: "bg-emerald-500/5", glow: "shadow-[0_0_50px_rgba(16,185,129,0.15)]" };
    if (score < 70) return { color: "text-amber-500", border: "border-amber-500/20", bg: "bg-amber-500/5", glow: "shadow-[0_0_50px_rgba(245,158,11,0.15)]" };
    return { color: "text-red-500", border: "border-red-500/20", bg: "bg-red-500/5", glow: "shadow-[0_0_50px_rgba(239,68,68,0.15)]" };
  };

  const styles = useMemo(() => getRiskStyles(riskScore), [riskScore]);
  const rotation = (riskScore / 100) * 180 - 90; // -90 to 90 degrees for a semi-circle effect

  return (
    <div 
      className="w-full h-[350px] relative flex items-center justify-center overflow-hidden"
      role="img"
      aria-label={`Risk Index Readout: ${riskScore}`}
    >
      {/* Background Grid Pattern for Technical Feel */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <div className={cn(
        "relative w-64 h-64 rounded-full flex items-center justify-center transition-all duration-1000",
        styles.border, styles.bg, styles.glow
      )}>
        {/* Outer Circular Progress */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-white/5"
          />
          <motion.circle
            cx="50" cy="50" r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="283"
            initial={{ strokeDashoffset: 283 }}
            animate={{ strokeDashoffset: 283 - (283 * riskScore) / 100 }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className={styles.color}
            strokeLinecap="round"
          />
        </svg>

        {/* Central Readout */}
        <div className="text-center z-10">
          <motion.div 
            key={riskScore}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <span className={cn("text-8xl font-black italic tracking-tighter leading-none mb-2", styles.color)}>
              {riskScore}
            </span>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 dark:text-white text-black">Risk Index</span>
              <div className={cn("h-1 w-8 rounded-full mt-2", styles.color.replace('text', 'bg'))} />
            </div>
          </motion.div>
        </div>

        {/* Scanning Beam / Secondary Indicator */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full opacity-40", styles.color.replace('text', 'bg'))} />
        </motion.div>
      </div>

      {/* Corporate Technical Annotation HUD */}
      <div className="absolute top-4 left-0 right-0 flex justify-between px-8">
        <div className="flex flex-col gap-1">
          <span className="text-[8px] font-black uppercase tracking-widest opacity-30 dark:text-white text-black">Source State</span>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold dark:text-white text-black">SYNCHRONIZED</span>
          </div>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-[8px] font-black uppercase tracking-widest opacity-30 dark:text-white text-black">Protocol</span>
          <span className="text-[10px] font-bold text-blue-500 uppercase">E2E-ENCRYPTED</span>
        </div>
      </div>

      {/* Decorative Corner Ornaments */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 dark:border-white/10 border-black/10" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 dark:border-white/10 border-black/10" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 dark:border-white/10 border-black/10" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 dark:border-white/10 border-black/10" />
    </div>
  );
};
