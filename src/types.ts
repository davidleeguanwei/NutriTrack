export type Gender = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';

export interface UserProfile {
  userId: string;
  gender: Gender;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  activityLevel: ActivityLevel;
  bmr: number;
  tdee: number;
  useCustomTarget: boolean;
  customCalorieTarget: number;
  waterCupVolumeMl: number;
  waterDailyCupsTarget: number;
  updatedAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodLog {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  foodName: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  servingAmount?: number;
  servingUnit?: string;
  createdAt?: string;
}

export interface WeightLog {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  note?: string;
  createdAt?: string;
}

export interface WaterLog {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  cups: number;
  cupVolumeMl: number;
  totalMl: number;
  updatedAt?: string;
}

export interface FavoriteFood {
  id?: string;
  userId: string;
  foodName: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  defaultServingUnit: string;
  category?: string;
  createdAt?: string;
}

export interface DailySummary {
  consumedCalories: number;
  totalProteinGrams: number;
  totalCarbsGrams: number;
  totalFatGrams: number;
  waterMl: number;
  waterCups: number;
}
