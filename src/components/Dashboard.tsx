import React from 'react';
import { 
  Flame, 
  Target, 
  Droplet, 
  Scale, 
  Plus, 
  Utensils, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  PieChart as PieIcon,
  Zap
} from 'lucide-react';
import { UserProfile, FoodLog, WaterLog, WeightLog, FavoriteFood } from '../types';
import { formatDateLabel } from '../lib/calculator';

interface DashboardProps {
  profile: UserProfile;
  foodLogs: FoodLog[];
  waterLog: WaterLog;
  weightLogs: WeightLog[];
  favoriteFoods: FavoriteFood[];
  selectedDate: string;
  onOpenAddFoodModal: () => void;
  onUpdateWaterCups: (newCups: number) => void;
  onQuickLogWeight: (weight: number) => void;
  onQuickAddFavoriteFood: (fav: FavoriteFood) => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profile,
  foodLogs,
  waterLog,
  weightLogs,
  selectedDate,
  favoriteFoods,
  onOpenAddFoodModal,
  onUpdateWaterCups,
  onQuickLogWeight,
  onQuickAddFavoriteFood,
  onNavigateTab,
}) => {
  // Calorie calculations
  const totalCalories = foodLogs.reduce((acc, item) => acc + (item.calories || 0), 0);
  const totalProtein = foodLogs.reduce((acc, item) => acc + (item.proteinGrams || 0), 0);
  const totalCarbs = foodLogs.reduce((acc, item) => acc + (item.carbsGrams || 0), 0);
  const totalFat = foodLogs.reduce((acc, item) => acc + (item.fatGrams || 0), 0);
  const totalFiber = foodLogs.reduce((acc, item) => acc + (item.fiberGrams || 0), 0);

  // Targets
  const bmr = profile.bmr || 1400;
  const tdeeLimit = profile.useCustomTarget && profile.customCalorieTarget > 0 
    ? profile.customCalorieTarget 
    : (profile.tdee || 1800);

  // BMR gap: how much more calories needed to hit BMR
  const caloriesNeededForBmr = Math.max(0, bmr - totalCalories);
  const hasReachedBmr = totalCalories >= bmr;

  // TDEE limit gap: how much calories remaining before hitting max TDEE
  const caloriesRemainingTdee = tdeeLimit - totalCalories;
  const isOverTdee = caloriesRemainingTdee < 0;

  // Meal type calories breakdown
  const breakfastCals = foodLogs.filter(f => f.mealType === 'breakfast').reduce((a, b) => a + b.calories, 0);
  const lunchCals = foodLogs.filter(f => f.mealType === 'lunch').reduce((a, b) => a + b.calories, 0);
  const dinnerCals = foodLogs.filter(f => f.mealType === 'dinner').reduce((a, b) => a + b.calories, 0);
  const snackCals = foodLogs.filter(f => f.mealType === 'snack').reduce((a, b) => a + b.calories, 0);

  // Macro calories
  const proteinCals = totalProtein * 4;
  const carbsCals = totalCarbs * 4;
  const fatCals = totalFat * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals || 1;

  const proteinPct = Math.round((proteinCals / totalMacroCals) * 100);
  const carbsPct = Math.round((carbsCals / totalMacroCals) * 100);
  const fatPct = Math.round((fatCals / totalMacroCals) * 100);

  // Latest weight
  const latestWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null;

  // Quick weight inline state
  const [quickWeightInput, setQuickWeightInput] = React.useState<string>('');

  const handleWeightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(quickWeightInput);
    if (!isNaN(val) && val > 20 && val < 300) {
      onQuickLogWeight(val);
      setQuickWeightInput('');
    }
  };

  return (
    <div id="dashboard-view" className="space-y-6 animate-fade-in">
      {/* Date banner & Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-600" /> 今日健康儀表板
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {formatDateLabel(selectedDate)}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            每日熱量與三大營養素追蹤
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            當前熱量：<strong className="text-emerald-600 font-bold">{totalCalories}</strong> kcal / 最高上限：<strong className="text-slate-700 font-semibold">{tdeeLimit}</strong> kcal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="quick-add-food-btn"
            onClick={onOpenAddFoodModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>新增飲食紀錄</span>
          </button>
        </div>
      </div>

      {/* Top Main Cards: BMR & TDEE Calorie Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Card 1: Consumed Calories & Progress Bar */}
        <div id="card-consumed-calories" className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-amber-500/20" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">今日總攝取熱量</h3>
                <p className="text-xs text-slate-500">已記錄的食物卡路里</p>
              </div>
            </div>
            <span className="text-3xl font-extrabold text-amber-600 tracking-tight">
              {totalCalories} <span className="text-xs text-slate-500 font-medium">kcal</span>
            </span>
          </div>

          {/* Progress Bar with BMR and TDEE Milestone */}
          <div className="space-y-1.5 my-2">
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>0 kcal</span>
              <span className="text-amber-700 font-bold">BMR: {bmr}</span>
              <span className="text-slate-700 font-bold">TDEE: {tdeeLimit}</span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 relative border border-slate-200">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverTdee 
                    ? 'bg-rose-500' 
                    : hasReachedBmr 
                      ? 'bg-emerald-500' 
                      : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(100, (totalCalories / tdeeLimit) * 100)}%` }}
              />
            </div>
          </div>

          {/* Calorie Stats Breakdown */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[11px]">目標參考值</span>
              <span className="font-bold text-slate-800 mt-0.5 block">
                {profile.useCustomTarget ? '自定義上限' : '每日 TDEE 上限'}
              </span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[11px]">基礎代謝率 (BMR)</span>
              <span className="font-bold text-emerald-600 mt-0.5 block">{bmr} kcal</span>
            </div>
          </div>
        </div>

        {/* Card 2: BMR Gap Indicator */}
        <div id="card-bmr-indicator" className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${hasReachedBmr ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                {hasReachedBmr ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">基礎代謝率 (BMR) 門檻</h3>
                <p className="text-xs text-slate-500">器官基本運作低限</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">
              {bmr} kcal
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 my-1">
            {hasReachedBmr ? (
              <div className="flex items-start gap-2 text-emerald-700">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold block text-slate-900">已達基礎代謝率需求！</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    今日已達到器官基本運作所需熱量。
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-amber-700">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <span className="text-xs font-bold block text-slate-900">
                    離達標還差 <span className="text-sm text-amber-600 font-extrabold">{caloriesNeededForBmr}</span> kcal
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    建議吃滿 BMR ({bmr} kcal) 以維持器官健康。
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            id="navigate-settings-from-bmr"
            onClick={() => onNavigateTab('settings')}
            className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors self-end font-medium"
          >
            <span>調整 BMR/TDEE 參數</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: TDEE Max Limit Indicator */}
        <div id="card-tdee-indicator" className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${isOverTdee ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">最高上限 (TDEE)</h3>
                <p className="text-xs text-slate-500">每日消耗總額度</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded bg-slate-100 text-slate-700">
              {tdeeLimit} kcal
            </span>
          </div>

          <div className={`p-4 rounded-xl my-1 border ${
            isOverTdee 
              ? 'bg-rose-50 border-rose-200 text-rose-800' 
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}>
            {isOverTdee ? (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold block text-rose-900">
                    超出熱量上限 <span className="text-sm font-extrabold">{Math.abs(caloriesRemainingTdee)}</span> kcal
                  </span>
                  <p className="text-xs text-rose-600 mt-0.5">
                    今日已超出預算額度，建議搭配運動調節。
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold block text-slate-900">
                    最多還剩 <span className="text-sm text-emerald-600 font-extrabold">{caloriesRemainingTdee}</span> kcal 可食用
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    預算範圍內，安心補充健康營養。
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500">
            <span>預算比例：{Math.round((totalCalories / tdeeLimit) * 100)}%</span>
            <button
              id="quick-add-food-from-tdee"
              onClick={onOpenAddFoodModal}
              className="text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              紀錄下一餐
            </button>
          </div>
        </div>

      </div>

      {/* Middle Section: Macronutrients Breakdown & Meal Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Macronutrients Card */}
        <div id="card-macronutrients" className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">三大營養素成分分析</h3>
            </div>
            <span className="text-xs text-slate-400">
              蛋白質 4kcal/g | 碳水 4kcal/g | 脂肪 9kcal/g
            </span>
          </div>

          {/* Visual Bar Distribution */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600 font-semibold">
              <span className="text-blue-600">蛋白質: {totalProtein}g ({proteinPct}%)</span>
              <span className="text-amber-600">澱粉/碳水: {totalCarbs}g ({carbsPct}%)</span>
              <span className="text-rose-600">脂肪: {totalFat}g ({fatPct}%)</span>
            </div>

            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-200">
              <div 
                className="h-full bg-blue-500 rounded-l-full transition-all duration-300"
                style={{ width: `${proteinPct}%` }}
                title={`蛋白質 ${totalProtein}g (${proteinPct}%)`}
              />
              <div 
                className="h-full bg-amber-400 transition-all duration-300"
                style={{ width: `${carbsPct}%` }}
                title={`澱粉/碳水 ${totalCarbs}g (${carbsPct}%)`}
              />
              <div 
                className="h-full bg-rose-400 rounded-r-full transition-all duration-300"
                style={{ width: `${fatPct}%` }}
                title={`脂肪 ${totalFat}g (${fatPct}%)`}
              />
            </div>
          </div>

          {/* Individual Macro Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-50 border border-blue-100 rounded-xl p-3">
              <span className="text-xs text-blue-600 font-bold block">蛋白質 (Protein)</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">{totalProtein}</span>
                <span className="text-xs text-slate-500">克</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">約 {proteinCals} kcal</span>
            </div>

            <div className="bg-slate-50 border border-amber-100 rounded-xl p-3">
              <span className="text-xs text-amber-600 font-bold block">澱粉/碳水 (Carbs)</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">{totalCarbs}</span>
                <span className="text-xs text-slate-500">克</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">約 {carbsCals} kcal</span>
            </div>

            <div className="bg-slate-50 border border-rose-100 rounded-xl p-3">
              <span className="text-xs text-rose-600 font-bold block">脂肪 (Fat)</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">{totalFat}</span>
                <span className="text-xs text-slate-500">克</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">約 {fatCals} kcal</span>
            </div>

            <div className="bg-slate-50 border border-emerald-100 rounded-xl p-3">
              <span className="text-xs text-emerald-600 font-bold block">膳食纖維 (Fiber)</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-bold text-slate-900">{totalFiber}</span>
                <span className="text-xs text-slate-500">克</span>
              </div>
              <span className="text-[11px] text-slate-400 block mt-0.5">助消化吸收</span>
            </div>
          </div>
        </div>

        {/* Meal Calories Distribution Card */}
        <div id="card-meals-summary" className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">各餐熱量分配</h3>
            </div>
            <button
              id="view-foodlog-btn"
              onClick={() => onNavigateTab('foodlog')}
              className="text-xs text-emerald-600 hover:underline flex items-center font-medium"
            >
              詳細明細 <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Breakfast */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="font-semibold text-slate-800">早餐 (Breakfast)</span>
              </div>
              <span className="font-bold text-slate-900">{breakfastCals} kcal</span>
            </div>

            {/* Lunch */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-800">午餐 (Lunch)</span>
              </div>
              <span className="font-bold text-slate-900">{lunchCals} kcal</span>
            </div>

            {/* Dinner */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-semibold text-slate-800">晚餐 (Dinner)</span>
              </div>
              <span className="font-bold text-slate-900">{dinnerCals} kcal</span>
            </div>

            {/* Snack */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span className="font-semibold text-slate-800">點心/宵夜 (Snack)</span>
              </div>
              <span className="font-bold text-slate-900">{snackCals} kcal</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Section: Water Quick Tracker & Weight Tracker Quick Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* Water Intake Tracker Quick Widget */}
        <div id="card-water-quick-widget" className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                <Droplet className="w-5 h-5 fill-blue-500/20" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">每日喝水紀錄</h3>
                <p className="text-xs text-slate-500">每杯 {waterLog.cupVolumeMl} ml</p>
              </div>
            </div>

            <button
              id="water-detail-link"
              onClick={() => onNavigateTab('water')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
            >
              設定目標 <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-2xl font-black text-blue-600">
                {waterLog.cups} <span className="text-xs font-semibold text-slate-500">/ {profile.waterDailyCupsTarget} 杯</span>
              </span>
              <span className="text-xs text-slate-500 block mt-0.5 font-medium">
                總容量：{waterLog.totalMl} / {profile.waterDailyCupsTarget * profile.waterCupVolumeMl} ml
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="quick-water-minus"
                onClick={() => onUpdateWaterCups(waterLog.cups - 1)}
                className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold flex items-center justify-center transition-colors border border-slate-300 shadow-xs active:scale-95"
                title="減少一杯"
              >
                -
              </button>
              <button
                id="quick-water-plus"
                onClick={() => onUpdateWaterCups(waterLog.cups + 1)}
                className="w-9 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold flex items-center justify-center transition-colors shadow-xs active:scale-95"
                title="增加一杯水"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Weight Tracker Quick Widget */}
        <div id="card-weight-quick-widget" className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">最新體重紀錄</h3>
                <p className="text-xs text-slate-500">追蹤體重趨勢</p>
              </div>
            </div>

            <button
              id="weight-detail-link"
              onClick={() => onNavigateTab('weight')}
              className="text-xs text-blue-600 hover:underline flex items-center gap-0.5 font-medium"
            >
              體重折線圖 <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900">
                {latestWeight ? `${latestWeight.weightKg} kg` : '尚無紀錄'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {latestWeight ? `最近日期: ${latestWeight.date}` : '歡迎輸入體重'}
              </span>
            </div>

            <form onSubmit={handleWeightSubmit} className="flex gap-2">
              <input
                id="quick-weight-input"
                type="number"
                step="0.1"
                placeholder="輸入體重 kg"
                value={quickWeightInput}
                onChange={(e) => setQuickWeightInput(e.target.value)}
                className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
              <button
                id="quick-weight-submit-btn"
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                儲存
              </button>
            </form>
          </div>
        </div>

        {/* Quick Favorite Food One-Tap Adder */}
        <div id="card-favorite-foods-quick" className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">常吃食物一鍵快加入</h3>
                <p className="text-xs text-slate-500">點擊直接紀錄至今日飲食</p>
              </div>
            </div>

            <button
              id="fav-food-detail-link"
              onClick={() => onNavigateTab('favorites')}
              className="text-xs text-emerald-600 hover:underline flex items-center gap-0.5 font-medium"
            >
              常吃庫 <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
            {favoriteFoods.slice(0, 6).map((fav) => (
              <button
                key={fav.id || fav.foodName}
                onClick={() => onQuickAddFavoriteFood(fav)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs text-slate-800 hover:text-emerald-700 transition-all text-left flex items-center justify-between gap-2 group shadow-2xs"
                title={`點擊加入 ${fav.foodName} (${fav.calories} kcal)`}
              >
                <span className="font-semibold">{fav.foodName}</span>
                <span className="text-[10px] font-bold text-emerald-600">
                  +{fav.calories}k
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
