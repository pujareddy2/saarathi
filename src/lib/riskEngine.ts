import { ContextData } from '../types';

export function calculateRiskScore(context: ContextData): number {
  let score = 0;

  // 1. Time Factor (Late night cravings)
  const hour = new Date(context.time).getHours();
  if (hour >= 22 || hour <= 4) {
    score += 45; // High risk: decision fatigue + circadian hunger
  } else if (hour >= 14 && hour <= 16) {
    score += 15; // Afternoon slump
  }

  // 2. Stress Level
  if (context.stressLevel > 8) score += 30;
  else if (context.stressLevel > 5) score += 15;

  // 3. Location Type
  if (context.locationType === 'fast_food_cluster') {
    score += 40;
  } else if (context.locationType === 'unknown') {
    score += 10;
  }

  // 4. Decision Fatigue
  if (context.decisionFatigue === 'high') score += 20;
  else if (context.decisionFatigue === 'medium') score += 10;

  return Math.min(score, 100);
}

export function getRiskLevel(score: number): 'Low' | 'Moderate' | 'High' | 'Extreme' {
  if (score < 30) return 'Low';
  if (score < 60) return 'Moderate';
  if (score < 85) return 'High';
  return 'Extreme';
}

export const SMART_SWAPS: Record<string, string[]> = {
  "Burger": ["Grilled Chicken Sandwich", "Black Bean Burger", "Quinoa Salad"],
  "Pizza": ["Cauliflower Crust Pizza", "Greek Salad", "Thin Crust Veggie Pizza"],
  "Soda": ["Sparkling Water with Lemon", "Iced Green Tea", "Kombucha"],
  "Chips": ["Roasted Chickpeas", "Air-popped Popcorn", "Apple Slices"],
  "Ice Cream": ["Greek Yogurt with Honey", "Frozen Banana", "Chia Pudding"]
};
