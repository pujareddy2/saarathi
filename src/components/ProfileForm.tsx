import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserProfile, UserGoal, Gender, Preference, Lifestyle, StressLevel } from '../types';
import { saveUserProfile } from '../lib/firebaseService';
import { cn } from '../lib/utils';
import { CheckCircle2, ChevronRight, Activity, Target, Zap, Waves } from 'lucide-react';

interface ProfileFormProps {
  userId: string;
  onComplete: (profile: UserProfile) => void;
  theme?: 'dark' | 'light';
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ userId, onComplete, theme = 'dark' }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    userId,
    age: 25,
    gender: 'other',
    goal: 'maintain',
    preference: 'veg',
    lifestyle: 'active',
    stress_level: 'medium'
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    const finalProfile = {
      ...formData,
      createdAt: Date.now(),
    } as UserProfile;
    
    await saveUserProfile(userId, finalProfile);
    onComplete(finalProfile);
  };

  const OptionCard = ({ label, value, icon: Icon, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "p-6 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-3",
        active 
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" 
          : cn("border-current opacity-20 hover:opacity-100", theme === 'dark' ? "text-white" : "text-slate-900")
      )}
    >
      <Icon className={cn("w-6 h-6", active ? "text-emerald-500" : "opacity-40")} />
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      {active && <CheckCircle2 className="w-4 h-4 mt-auto" />}
    </button>
  );

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center p-8 transition-colors duration-1000",
      theme === 'dark' ? "bg-black" : "bg-slate-50"
    )}>
      <motion.div 
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-md z-10 space-y-8"
      >
        <div className="mb-8">
           <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-emerald-500" : "bg-zinc-800")} />
              ))}
           </div>
           <h2 className={cn("text-3xl font-black italic uppercase tracking-tighter leading-none", theme === 'dark' ? "text-white" : "text-slate-900")}>
              {step === 1 && "The Basics"}
              {step === 2 && "The Goal"}
              {step === 3 && "Habit Loop"}
              {step === 4 && "Intensity"}
           </h2>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mt-2">Intelligence Calibration</p>
        </div>

        <div className="space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-2 dark:text-white text-slate-900">Your Age</label>
                <input 
                  type="number" 
                  value={formData.age} 
                  onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                  className={cn(
                    "w-full p-5 rounded-2xl border-2 bg-transparent font-black italic text-xl transition-all outline-none",
                    theme === 'dark' ? "border-white/10 text-white focus:border-emerald-500" : "border-slate-200 text-slate-900 focus:border-emerald-500"
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['male', 'female', 'other'].map(g => (
                  <OptionCard 
                    key={g} 
                    label={g} 
                    icon={Activity} 
                    active={formData.gender === g} 
                    onClick={() => setFormData({...formData, gender: g as Gender})} 
                  />
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-3">
               {[
                 { id: 'weight_loss', label: 'Weight Loss', icon: Target },
                 { id: 'maintain', label: 'Maintenance', icon: Waves },
                 { id: 'gain', label: 'Growth', icon: Zap }
               ].map(g => (
                 <button
                    key={g.id}
                    onClick={() => setFormData({...formData, goal: g.id as UserGoal})}
                    className={cn(
                      "p-6 rounded-3xl border-2 transition-all flex items-center gap-6 text-left",
                      formData.goal === g.id 
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" 
                        : cn("border-current opacity-20 hover:opacity-100", theme === 'dark' ? "text-white" : "text-slate-900")
                    )}
                 >
                    <g.icon className="w-8 h-8" />
                    <span className="text-xl font-black italic uppercase tracking-tighter">{g.label}</span>
                    {formData.goal === g.id && <CheckCircle2 className="w-5 h-5 ml-auto" />}
                 </button>
               ))}
            </div>
          )}

          {step === 3 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 text-[10px] font-black uppercase tracking-widest opacity-40 px-2 dark:text-white text-slate-900">Food Preference</div>
              {['veg', 'non-veg'].map(p => (
                <OptionCard 
                  key={p} 
                  label={p} 
                  icon={Activity} 
                  active={formData.preference === p} 
                  onClick={() => setFormData({...formData, preference: p as Preference})} 
                />
              ))}
              <div className="col-span-2 mt-4 text-[10px] font-black uppercase tracking-widest opacity-40 px-2 dark:text-white text-slate-900">Mobility Profile</div>
              {['active', 'sedentary'].map(l => (
                <OptionCard 
                  key={l} 
                  label={l} 
                  icon={Activity} 
                  active={formData.lifestyle === l} 
                  onClick={() => setFormData({...formData, lifestyle: l as Lifestyle})} 
                />
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 px-2 dark:text-white text-slate-900">Average Stress Load</label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => setFormData({...formData, stress_level: s as StressLevel})}
                        className={cn(
                          "flex-1 py-4 rounded-2xl border-2 font-black uppercase tracking-widest transition-all",
                          formData.stress_level === s 
                            ? "bg-emerald-500 border-emerald-500 text-black" 
                            : cn("border-current opacity-20", theme === 'dark' ? "text-white" : "text-slate-900")
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/20 italic font-bold text-emerald-500/80 text-center">
                  “I am ready to receive intelligent guidance synchronized with my physiological state.”
               </div>
            </div>
          )}
        </div>

        <div className="flex gap-4 pt-8">
          {step > 1 && (
            <button 
              onClick={prevStep}
              className={cn("p-5 rounded-2xl border-2 font-black uppercase tracking-widest", theme === 'dark' ? "border-white/10 text-white" : "border-slate-200 text-slate-900")}
            >
              Back
            </button>
          )}
          <button
            onClick={step === 4 ? handleSubmit : nextStep}
            className={cn(
              "flex-1 p-5 rounded-2xl font-black italic uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95",
              theme === 'dark' ? "bg-white text-black hover:bg-emerald-400" : "bg-slate-900 text-white hover:bg-emerald-600"
            )}
          >
            {step === 4 ? "CALIBRATE PROTOCOL" : "CONTINUE FLOW"}
            <ChevronRight className="w-5 h-5 font-black" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
