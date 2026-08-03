import { ActivityLevel, Gender, UserProfile } from '../types';

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, { label: string; desc: string; factor: number }> = {
  sedentary: { label: '久坐少動', desc: '辦公室工作，幾乎不運動', factor: 1.2 },
  light: { label: '輕度活動', desc: '每週運動 1-3 天', factor: 1.375 },
  moderate: { label: '中度活動', desc: '每週運動 3-5 天', factor: 1.55 },
  active: { label: '高度活動', desc: '每週運動 6-7 天', factor: 1.725 },
  veryActive: { label: '非常活躍', desc: '勞力工作或高強度訓練', factor: 1.9 },
};

/**
 * Calculates BMR using Mifflen-St Jeor Formula
 * Men: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
 * Women: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
 */
export function calculateBMR(gender: Gender, weightKg: number, heightCm: number, ageYears: number): number {
  if (!weightKg || !heightCm || !ageYears) return 1500;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  const bmr = gender === 'male' ? base + 5 : base - 161;
  return Math.round(Math.max(800, bmr));
}

/**
 * Calculates TDEE based on BMR and Activity Factor
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const factor = ACTIVITY_LEVEL_LABELS[activityLevel]?.factor || 1.2;
  return Math.round(bmr * factor);
}

/**
 * Get today's date in YYYY-MM-DD local timezone
 */
export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  if (!y || !m || !d) return dateStr;
  const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
  const weekDays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  return `${m}/${d} (${weekDays[dateObj.getDay()]})`;
}

/**
 * Default User Profile for new users
 */
export const DEFAULT_USER_PROFILE: UserProfile = {
  userId: '',
  gender: 'female',
  age: 28,
  height: 165,
  weight: 58,
  activityLevel: 'light',
  bmr: 1320,
  tdee: 1815,
  useCustomTarget: false,
  customCalorieTarget: 1800,
  waterCupVolumeMl: 250,
  waterDailyCupsTarget: 8,
  updatedAt: new Date().toISOString(),
};

/**
 * Pre-populated initial favorite foods for quick discovery
 */
export const SAMPLE_FAVORITE_FOODS = [
  {
    foodName: '即食雞胸肉',
    calories: 165,
    proteinGrams: 31,
    carbsGrams: 1,
    fatGrams: 3,
    defaultServingUnit: '片 (100g)',
    category: '高蛋白質'
  },
  {
    foodName: '水煮蛋',
    calories: 75,
    proteinGrams: 6.3,
    carbsGrams: 0.6,
    fatGrams: 5.3,
    defaultServingUnit: '顆 (50g)',
    category: '高蛋白質'
  },
  {
    foodName: '糙米飯',
    calories: 215,
    proteinGrams: 5,
    carbsGrams: 45,
    fatGrams: 1.8,
    defaultServingUnit: '碗 (150g)',
    category: '全穀雜糧'
  },
  {
    foodName: '香蕉',
    calories: 105,
    proteinGrams: 1.3,
    carbsGrams: 27,
    fatGrams: 0.3,
    defaultServingUnit: '根 (120g)',
    category: '水果'
  },
  {
    foodName: '無糖拿鐵',
    calories: 120,
    proteinGrams: 6,
    carbsGrams: 9,
    fatGrams: 6,
    defaultServingUnit: '杯 (360ml)',
    category: '飲料'
  },
  {
    foodName: '煎鮭魚排',
    calories: 280,
    proteinGrams: 25,
    carbsGrams: 0,
    fatGrams: 19,
    defaultServingUnit: '份 (150g)',
    category: '海鮮蛋白質'
  },
  {
    foodName: '全脂鮮乳',
    calories: 150,
    proteinGrams: 8,
    carbsGrams: 12,
    fatGrams: 8,
    defaultServingUnit: '杯 (240ml)',
    category: '乳品類'
  },
  {
    foodName: '地瓜',
    calories: 140,
    proteinGrams: 2,
    carbsGrams: 33,
    fatGrams: 0.2,
    defaultServingUnit: '中等大小 (110g)',
    category: '全穀雜糧'
  }
];
