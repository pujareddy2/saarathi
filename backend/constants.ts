// backend/constants.ts

export const FOOD_GUIDANCE: Record<string, { swap: string; insight: string }> = {
  'biryani': { 
    swap: 'Half-portion Paneer Biryani + extra raita', 
    insight: 'High glycemic load detected. Extra raita helps stabilize insulin response.' 
  },
  'pizza': { 
    swap: 'Thin-crust veggie pizza with light cheese', 
    insight: 'Saturated fat density varies by crust. Thin-crust reduces excess calories by 30%.' 
  },
  'burger': { 
    swap: 'Grilled chicken sandwich or lettuce wrap', 
    insight: 'Refined carbs in buns often trigger energy crashes. Lettuce wraps maintain steady glucose.' 
  },
  'soda': { 
    swap: 'Sparkling water with lime', 
    insight: 'Liquid sugar is the highest risk factor for metabolic stress.' 
  },
  'chips': { 
    swap: 'Roasted Makhana or Handful of Almonds', 
    insight: 'High sodium levels increase cravings. Magnesium in nuts helps resolve stress.' 
  },
  'rice': {
    swap: 'Brown rice or Cauliflower rice',
    insight: 'White rice has a high glycemic index. Brown rice provides slow-release energy.'
  },
  'bread': {
    swap: 'Whole grain bread or Keto wrap',
    insight: 'Refined flour increases insulin spikes. Whole grains provide essential fiber.'
  }
};

export const FOOD_KEYWORDS = ["food", "meal", "dish", "biryani", "pizza", "burger", "rice", "bread", "eating", "cuisine"];

export const FOOD_MAPPING: Record<string, string> = {
  "rice": "biryani",
  "pizza": "pizza",
  "burger": "burger",
  "bread": "bread",
  "biryani": "biryani"
};

export const DEFAULT_GUIDANCE = { 
  swap: 'Small mindful portion of your choice', 
  insight: 'Pause for 5 minutes. Awareness is the first step to balance.' 
};
