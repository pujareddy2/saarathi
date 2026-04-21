export type UserGoal = 'weight_loss' | 'maintain' | 'gain';
export type Gender = 'male' | 'female' | 'other';
export type Preference = 'veg' | 'non-veg';
export type Lifestyle = 'active' | 'sedentary';
export type StressLevel = 'low' | 'medium' | 'high';

export interface UserProfile {
  userId: string;
  age: number;
  gender: Gender;
  goal: UserGoal;
  preference: Preference;
  lifestyle: Lifestyle;
  sleep_pattern?: string;
  eating_habits?: string;
  stress_level?: StressLevel;
  createdAt: number;
  updatedAt?: number;
}

export interface ContextData {
  time: number;
  stressLevel: number; // 1-10
  locationName: string;
  locationType: 'home' | 'office' | 'fast_food_cluster' | 'grocery' | 'unknown';
  decisionFatigue: 'low' | 'medium' | 'high';
}

export interface DecisionLog {
  userId: string;
  timestamp: number;
  context: ContextData;
  scannedFood?: string;
  nudge?: string;
  action: 'ignored' | 'swapped' | 'declined' | 'accepted';
  riskScore: number;
}
