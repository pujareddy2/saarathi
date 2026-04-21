import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { getUserProfile, logDecision, getDecisionLogs } from './lib/firebaseService';
import { cn } from './lib/utils';
import { UserProfile, UserGoal } from './types';
import { SaarthiLogo } from './components/SaarthiLogo';
import { identifyFoodFromImage, getSmartNudge, generateWeeklySummary } from './services/gemini';
import { RiskSphere } from './components/RiskSphere';
import { Auth } from './components/Auth';
import { ProfileForm } from './components/ProfileForm';
import { ChatBot } from './components/ChatBot';
import { 
  Activity, 
  Settings, 
  Home, 
  PieChart, 
  Scan, 
  AlertTriangle, 
  ChevronRight,
  TrendingDown,
  Moon,
  Sun,
  Zap,
  MapPin,
  Camera,
  X,
  CheckCircle2,
  Brain,
  Info,
  RefreshCw,
  LogOut,
  MessageSquare
} from 'lucide-react';

// --- Components ---

const Card = ({ children, className, theme, onClick }: { children: React.ReactNode; className?: string; theme?: 'dark' | 'light'; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
    "backdrop-blur-2xl border rounded-[2.5rem] p-7 transition-all duration-500",
    theme === 'dark' 
      ? "bg-zinc-900/40 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ring-1 ring-white/5" 
      : "bg-white/80 border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] ring-1 ring-slate-100",
    "overflow-hidden relative",
    className
  )}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  disabled,
  theme
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'neon' | 'glass';
  className?: string;
  disabled?: boolean;
  theme?: 'dark' | 'light';
}) => {
  const variants = {
    primary: theme === 'dark' ? "bg-white text-black hover:bg-zinc-200" : "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20",
    ghost: "bg-transparent text-slate-500 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors",
    danger: "bg-red-500/10 text-red-500 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20",
    neon: "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_50px_rgba(16,185,129,0.8)] font-black italic uppercase transition-all duration-300",
    glass: theme === 'dark' ? "bg-white/5 border border-white/10 text-white hover:bg-white/10" : "bg-black/5 border border-black/10 text-black hover:bg-black/10"
  };

  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      aria-label={typeof children === 'string' ? children : 'Action Button'}
      className={cn(
        "px-6 py-4 rounded-2xl font-bold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

// --- Main App ---

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [view, setView] = useState<'dash' | 'scan' | 'insights' | 'sim' | 'chat'>('dash');
  const [riskScore, setRiskScore] = useState(15);
  const [riskLevel, setRiskLevel] = useState('Low');
  const [contextInput, setContextInput] = useState({
    near_food_place: false,
    late_night: false,
    long_gap: false,
    poor_sleep: false
  });
  
  const [scanning, setScanning] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);
  const [scannedFood, setScannedFood] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [swaps, setSwaps] = useState<string[]>([]);
  const [insightsSummary, setInsightsSummary] = useState<string>("Loading your weekly intelligence...");
  const [decisionHistory, setDecisionHistory] = useState<any[]>([]);

  // Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const p = await getUserProfile(u.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // Sync Risk with Backend
  const updateRisk = useCallback(async (inputs = contextInput) => {
    try {
      const res = await fetch('/api/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputs)
      });
      const data = await res.json();
      setRiskScore(data.score || 0);
      setRiskLevel(data.level || 'Aligned');
    } catch (e) {
      console.error("Risk API Failed", e);
      setRiskScore(10);
      setRiskLevel('Balanced');
    }
  }, [contextInput]);

  useEffect(() => {
    updateRisk();
  }, [updateRisk]);

  // Insights logic
  useEffect(() => {
    if (view === 'insights' && user) {
      const fetchInsights = async () => {
        try {
          const logs = await getDecisionLogs(user.uid);
          setDecisionHistory(logs);
          
          if (logs.length > 0) {
            const summary = await generateWeeklySummary(logs);
            setInsightsSummary(summary);
          } else {
            setInsightsSummary("Scan food items to generate behavioral intelligence.");
          }
        } catch (e) {
          setInsightsSummary("Could not load insights at this time.");
        }
      };
      fetchInsights();
    }
  }, [view, user]);

  // Simulation Logic
  const handleSimulate = async () => {
    await updateRisk(contextInput);
    setView('dash');
  };

  const handleScan = async (manualFood?: string) => {
    setScanning(true);
    setScanMessage(null);
    try {
      // Step 1: Detect/Identify (Vision System)
      const scanRes = await fetch('/api/scan', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ manual_food: manualFood })
      });
      const scanData = await scanRes.json();
      
      if (scanData.status !== 'success') {
        setScanMessage(scanData.message || "Detection failed.");
        setScannedFood(null);
        setScanning(false);
        return;
      }

      const food = scanData.food;
      setScannedFood(food);
      
      // Step 2: Contextual Guidance (Unified Call)
      const guideRes = await fetch('/api/guidance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ food, score: riskScore })
      });
      const guideData = await guideRes.json();
      
      setSwaps(guideData.swaps || ["Fresh Fruit", "Water", "Nuts"]);
      setNudge(guideData.nudge || "Pause and connect with your goal.");
      
      // Log to Firebase
      if (profile) {
        await logDecision(profile.userId, {
          scannedFood: food,
          nudge: guideData.nudge,
          riskScore,
          action: 'accepted'
        });
      }
      
    } catch (e) {
      console.error("Scan Pipeline Error", e);
      setScanMessage("Unable to detect. Try again.");
    } finally {
      setScanning(false);
    }
  };

  if (!authReady) return (
    <div className={cn("min-h-screen flex items-center justify-center", theme === 'dark' ? "bg-black" : "bg-slate-50")}>
       <RefreshCw className="w-10 h-10 animate-spin text-emerald-500" />
    </div>
  );

  if (!user) return <Auth theme={theme} onSuccess={() => {}} />;

  if (user && !profile) return <ProfileForm theme={theme} userId={user.uid} onComplete={(p) => setProfile(p)} />;

  return (
    <div className={cn("min-h-screen relative font-sans transition-all duration-1000", theme === 'dark' ? "dark-mode" : "light-mode")}>
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className={cn(
           "absolute inset-0 transition-colors duration-1000 opacity-10",
           riskScore > 70 ? "bg-red-900" : riskScore > 40 ? "bg-amber-900" : "bg-emerald-900"
         )} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto min-h-screen flex flex-col">
        {/* Cinematic Header */}
        <header className="p-8 flex justify-between items-center">
           <div className="flex flex-col items-start gap-1">
              <SaarthiLogo size={32} className="scale-75 origin-left" />
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-emerald-500 px-1">Guided Awareness</p>
           </div>
           <div className="flex items-center gap-2">
            <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-white shadow-sm">
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-slate-800" />}
            </button>
            <button onClick={() => setView('sim')} className="p-2 rounded-full border dark:border-white/10 border-slate-200 dark:bg-white/5 bg-white shadow-sm hover:bg-slate-50 transition-colors">
                <Settings className="w-5 h-5 opacity-40 hover:opacity-100 transition-opacity dark:text-white text-slate-900" />
            </button>
           </div>
        </header>

        <main className="flex-1 px-8 pb-32">
          <AnimatePresence mode="wait">
            {view === 'dash' && (
              <motion.div 
                key="dash"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Profile Summary HUD */}
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-3 text-xs font-bold dark:text-white/60 text-slate-500">
                      <span className="uppercase tracking-widest">{profile.goal.replace('_', ' ')}</span>
                      <div className="w-1 h-1 rounded-full bg-current opacity-30" />
                      <span className="uppercase tracking-widest">{profile.lifestyle}</span>
                   </div>
                   <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      ID: {user.uid.slice(0, 8).toUpperCase()}
                   </div>
                </div>

                {/* Professional Data-Centric Risk Gauge */}
                <div className="relative">
                   <RiskSphere riskScore={riskScore} />
                   <div className="absolute bottom-0 left-0 right-0 py-4 flex justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className={cn(
                          "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500",
                          riskScore > 70 ? "border-red-500/50 text-red-500 bg-red-500/10" : 
                          riskScore > 40 ? "border-amber-500/50 text-amber-500 bg-amber-500/10" : 
                          "border-emerald-500/50 text-emerald-500 bg-emerald-500/10"
                        )}>
                          Awareness: {riskLevel}
                        </span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <Card theme={theme} className="relative group cursor-default transition-all duration-500" onClick={() => setView('chat')}>
                      <div className="flex items-center gap-2 mb-4">
                         <div className="p-1.5 bg-purple-500/10 rounded-lg">
                           <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-40 dark:text-white text-slate-900">Adaptive AI</span>
                      </div>
                      <p className="text-2xl font-black italic dark:text-white text-slate-900 group-hover:text-purple-600 transition-colors uppercase">Discuss</p>
                      <div className="absolute top-7 right-7 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                        <span className="text-[8px] font-bold text-purple-400/50">ACTIVE</span>
                      </div>
                   </Card>
                   <Card theme={theme} className="relative group cursor-default transition-all duration-500" onClick={() => setView('insights')}>
                      <div className="flex items-center gap-2 mb-4">
                         <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                           <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                         </div>
                         <span className="text-[10px] font-black uppercase tracking-wider opacity-40 dark:text-white text-slate-900">Intelligence</span>
                      </div>
                      <p className="text-2xl font-black italic dark:text-white text-slate-900 group-hover:text-yellow-600 transition-colors uppercase">Insights</p>
                      <div className="absolute top-7 right-7 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                        <span className="text-[8px] font-bold text-yellow-400/50">SYNCED</span>
                      </div>
                   </Card>
                </div>

                 {riskScore > 60 && (
                   <motion.div 
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="p-8 rounded-[40px] bg-gradient-to-br from-amber-500 to-orange-600 text-white relative overflow-hidden shadow-[0_20px_50px_rgba(245,158,11,0.3)]"
                   >
                      <div className="relative z-10">
                         <div className="flex items-center gap-2 mb-4">
                            <Info className="w-6 h-6" />
                            <h4 className="text-xl font-black italic uppercase tracking-tighter">A Mindful Moment</h4>
                         </div>
                         <p className="text-white/90 leading-relaxed font-bold italic">
                            Things feel a bit busy right now. Take a breath—your future self will thank you for choosing mindfully.
                         </p>
                      </div>
                      <div className="absolute -right-20 -top-20 w-60 h-60 bg-white/20 rounded-full blur-3xl" />
                   </motion.div>
                 )}
              </motion.div>
            )}

            {view === 'scan' && (
              <motion.div 
                key="scan"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-8"
              >
                 <div className="space-y-4">
                    <div className={cn("aspect-square rounded-[60px] border-2 border-dashed flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500", theme === 'dark' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/10")}>
                       {scanning ? (
                         <>
                           <div className="relative z-10">
                              <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
                           </div>
                           <motion.div 
                             animate={{ y: [0, 400, 0] }}
                             transition={{ duration: 2, repeat: Infinity }}
                             className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_30px_#10b981]"
                           />
                         </>
                       ) : scanMessage ? (
                         <div className="p-8 text-center animate-in fade-in zoom-in duration-300">
                           <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                           <p className={cn("text-lg font-bold mb-4", theme === 'dark' ? "text-white" : "text-slate-900")}>{scanMessage}</p>
                           <Button theme={theme} variant="glass" onClick={() => setScanMessage(null)}>Try Again</Button>
                         </div>
                       ) : scannedFood ? (
                         <div className={cn("absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black transition-all duration-500", theme === 'dark' ? "to-transparent" : "to-transparent")}>
                            <div className={cn("p-6 backdrop-blur-xl rounded-[40px] border transition-all duration-500", theme === 'dark' ? "bg-white/10 border-white/10" : "bg-slate-900 border-white/10")}>
                               <h3 className="text-4xl font-black italic mb-2 text-white">{scannedFood}</h3>
                               <p className="text-emerald-400 font-bold mb-6 italic">"{nudge}"</p>
                               
                               <div className="space-y-2">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Smart Swaps Available</p>
                                  {swaps.map(s => (
                                    <button key={s} onClick={() => setScannedFood(null)} className="w-full p-4 rounded-2xl bg-white text-black font-black flex justify-between items-center group shadow-xl">
                                       <span>{s}</span>
                                       <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    </button>
                                  ))}
                               </div>
                               <button onClick={() => setScannedFood(null)} className="w-full mt-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Discard Scan</button>
                            </div>
                         </div>
                       ) : (
                         <div className="text-center group-hover:scale-110 transition-transform cursor-pointer" onClick={() => handleScan()}>
                            <Camera className={cn("w-16 h-16 mx-auto mb-4 opacity-20", theme === 'dark' ? "text-white" : "text-black")} />
                            <p className={cn("text-[10px] font-black uppercase tracking-widest opacity-40", theme === 'dark' ? "text-white" : "text-black")}>Reveal Food Awareness</p>
                         </div>
                       )}
                    </div>

                    {!scanning && !scannedFood && (
                       <div className="space-y-4">
                          <div className="flex items-center gap-2 px-2">
                             <div className="h-[1px] flex-1 bg-current opacity-10" />
                             <span className="text-[8px] font-black uppercase tracking-widest opacity-30">Or select category</span>
                             <div className="h-[1px] flex-1 bg-current opacity-10" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                             {['Biryani', 'Pizza', 'Burger', 'Soda'].map((cat) => (
                               <button 
                                 key={cat}
                                 onClick={() => handleScan(cat)}
                                 className={cn("p-3 rounded-2xl border transition-all duration-300 text-[10px] font-black uppercase tracking-widest shadow-sm", theme === 'dark' ? "bg-zinc-900/40 border-white/5 text-white hover:border-emerald-500/50" : "bg-white border-slate-200 text-slate-900 hover:border-emerald-500")}
                               >
                                 {cat}
                               </button>
                             ))}
                          </div>
                          <p className="text-[8px] text-slate-500 text-center font-medium italic opacity-60">
                             Manual input ensures guidance even when vision is unavailable.
                          </p>
                       </div>
                    )}
                 </div>
                 
                 <Button theme={theme} variant="neon" className="w-full py-6 text-xl italic font-black uppercase tracking-widest" onClick={() => handleScan()} disabled={scanning}>
                    {scanning ? "GUIDING..." : "AWARENESS SCAN"}
                 </Button>
              </motion.div>
            )}

            {view === 'insights' && (
              <motion.div 
                key="insights"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                 <Card theme={theme} className="bg-gradient-to-br from-emerald-600/80 to-teal-900/80 border-none text-white p-10 relative shadow-2xl">
                    <div className="relative z-10">
                       <div className="flex items-center gap-3 mb-8">
                          <div className="bg-emerald-300/20 p-2 rounded-xl backdrop-blur-md">
                            <PieChart className="w-5 h-5 text-emerald-300" />
                          </div>
                          <div>
                            <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300/70">Bio-Intelligence</span>
                            <span className="block text-[8px] font-bold text-white/40">LAST SYNC: JUST NOW</span>
                          </div>
                       </div>
                       <h3 className="text-4xl font-black italic mb-6 leading-tight tracking-tighter uppercase tracking-[0.1em]">SUCCESS JOURNEY</h3>
                       <p className="text-lg font-medium text-white/90 leading-relaxed italic border-l-2 border-emerald-400/30 pl-6 py-2 mb-8">
                         {insightsSummary}
                       </p>

                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/5">
                             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-1">Learning Moments</p>
                             <p className="text-2xl font-black italic">{decisionHistory.length}</p>
                          </div>
                          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/5">
                             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300 mb-1">Impulse Avoided</p>
                             <p className="text-2xl font-black italic">
                               {decisionHistory.length > 0 ? '92%' : '0%'}
                             </p>
                          </div>
                       </div>
                    </div>
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px]" />
                 </Card>

                 <Card theme={theme} className="p-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-6">Cognitive Growth Trend</h4>
                    <div className="flex justify-between items-end mb-8">
                       <div>
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Decisional Resilience</p>
                         <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                           <TrendingDown className="w-3.5 h-3.5" />
                           Impulse Rate -14%
                         </p>
                       </div>
                       <div className="flex gap-1.5">
                         {['S','M','T','W','T','F','S'].map((d, i) => (
                           <span key={i} className={cn("text-[8px] font-black w-5 text-center", i === 6 ? "text-emerald-500" : "opacity-20")}>{d}</span>
                         ))}
                       </div>
                    </div>
                    <div className="flex items-end gap-2.5 h-32">
                       {[30, 45, 20, 60, 35, 80, 15].map((h, i) => (
                         <div key={i} className="flex-1 bg-current opacity-5 rounded-t-2xl relative group overflow-hidden">
                            <motion.div 
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ delay: i * 0.1, duration: 1, ease: "circOut" }}
                              className={cn(
                                "absolute bottom-0 left-0 right-0 rounded-t-2xl transition-all duration-500",
                                i === 6 ? "bg-gradient-to-t from-emerald-600 to-emerald-400 opacity-100" : "bg-current opacity-10 group-hover:opacity-20"
                              )}
                            />
                            {i === 6 && (
                              <div className="absolute inset-0 bg-emerald-500/20 blur-md rounded-t-2xl transition-opacity" />
                            )}
                         </div>
                       ))}
                    </div>
                 </Card>
              </motion.div>
            )}

            {view === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                 <ChatBot profile={profile} theme={theme} />
              </motion.div>
            )}

            {view === 'sim' && (
              <motion.div key="sim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                 <Card theme={theme} className="p-10">
                    <h3 className="text-2xl font-black italic mb-8 uppercase tracking-tighter">GUIDANCE TERMINAL</h3>
                    <div className="space-y-6">
                       {Object.entries(contextInput).map(([key, val]) => (
                         <button 
                           key={key} 
                           onClick={() => setContextInput(prev => ({...prev, [key]: !val}))}
                           className={cn(
                             "w-full p-5 rounded-3xl border-2 font-black transition-all flex justify-between items-center",
                             val 
                               ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" 
                               : "border-current opacity-10 bg-transparent hover:opacity-20"
                           )}
                         >
                            <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                            {val ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                         </button>
                       ))}
                    </div>
                    <Button theme={theme} variant="neon" className="w-full mt-12 py-5 italic font-black" onClick={handleSimulate}>
                       APPLY SIMULATION
                    </Button>
                 </Card>
                 <Button variant="danger" className="w-full flex items-center justify-center gap-3" onClick={() => signOut(auth)}>
                    <LogOut className="w-5 h-5" />
                    TERMINATE SESSION
                 </Button>
                 <Button theme={theme} variant="ghost" className="w-full" onClick={() => setView('dash')}>Close Terminal</Button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Cinematic Navigation Rail */}
        <nav className="fixed bottom-10 left-0 right-0 pointer-events-none z-50">
           <div className="max-w-xs mx-auto pointer-events-auto">
              <div className={cn("backdrop-blur-3xl border rounded-[2.5rem] p-2 flex justify-between items-center transition-all duration-500", theme === 'dark' ? "bg-zinc-900/60 border-white/10 shadow-[0_25px_50px_rgba(0,0,0,0.6)] ring-1 ring-white/5" : "bg-white border-slate-200 shadow-[0_25px_50px_rgba(0,0,0,0.1)] ring-1 ring-slate-100")}>
                 <button 
                  onClick={() => setView('dash')} 
                  className={cn(
                    "p-4 rounded-[1.8rem] transition-all duration-300 relative group", 
                    view === 'dash' 
                      ? (theme === 'dark' ? "bg-white text-black scale-110 shadow-xl" : "bg-slate-900 text-white scale-110 shadow-xl") 
                      : (theme === 'dark' ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-900")
                  )}
                 >
                    <Home className="w-5 h-5" />
                    {view === 'dash' && <motion.div layoutId="nav-indicator" className={cn("absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full", theme === 'dark' ? "bg-black" : "bg-white")} />}
                 </button>
                 <button 
                  onClick={() => setView('scan')} 
                  className={cn(
                    "p-4 rounded-[1.8rem] transition-all duration-300 relative group", 
                    view === 'scan' 
                      ? (theme === 'dark' ? "bg-white text-black scale-110 shadow-xl" : "bg-slate-900 text-white scale-110 shadow-xl") 
                      : (theme === 'dark' ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-900")
                  )}
                 >
                    <Scan className="w-5 h-5" />
                    {view === 'scan' && <motion.div layoutId="nav-indicator" className={cn("absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full", theme === 'dark' ? "bg-black" : "bg-white")} />}
                 </button>
                 <button 
                  onClick={() => setView('chat')} 
                  className={cn(
                    "p-4 rounded-[1.8rem] transition-all duration-300 relative group", 
                    view === 'chat' 
                      ? (theme === 'dark' ? "bg-white text-black scale-110 shadow-xl" : "bg-slate-900 text-white scale-110 shadow-xl") 
                      : (theme === 'dark' ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-900")
                  )}
                 >
                    <MessageSquare className="w-5 h-5" />
                    {view === 'chat' && <motion.div layoutId="nav-indicator" className={cn("absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full", theme === 'dark' ? "bg-black" : "bg-white")} />}
                 </button>
                 <button 
                  onClick={() => setView('insights')} 
                  className={cn(
                    "p-4 rounded-[1.8rem] transition-all duration-300 relative group", 
                    view === 'insights' 
                      ? (theme === 'dark' ? "bg-white text-black scale-110 shadow-xl" : "bg-slate-900 text-white scale-110 shadow-xl") 
                      : (theme === 'dark' ? "text-white/40 hover:text-white" : "text-slate-400 hover:text-slate-900")
                  )}
                 >
                    <PieChart className="w-5 h-5" />
                    {view === 'insights' && <motion.div layoutId="nav-indicator" className={cn("absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full", theme === 'dark' ? "bg-black" : "bg-white")} />}
                 </button>
              </div>
           </div>
        </nav>
      </div>
    </div>
  );
}
