import React from 'react';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Coffee, 
  Sun, 
  Moon, 
  Cookie
} from 'lucide-react';
import { FoodLog, MealType, FavoriteFood } from '../types';
import { formatDateLabel } from '../lib/calculator';

interface FoodLogSectionProps {
  foodLogs: FoodLog[];
  selectedDate: string;
  favoriteFoods: FavoriteFood[];
  onOpenAddModal: () => void;
  onDeleteLog: (id: string) => void;
  onQuickAddFavoriteFood: (fav: FavoriteFood) => void;
}

export const FoodLogSection: React.FC<FoodLogSectionProps> = ({
  foodLogs,
  selectedDate,
  favoriteFoods,
  onOpenAddModal,
  onDeleteLog,
  onQuickAddFavoriteFood,
}) => {
  const totalCalories = foodLogs.reduce((acc, item) => acc + item.calories, 0);
  const totalProtein = foodLogs.reduce((acc, item) => acc + item.proteinGrams, 0);
  const totalCarbs = foodLogs.reduce((acc, item) => acc + item.carbsGrams, 0);
  const totalFat = foodLogs.reduce((acc, item) => acc + item.fatGrams, 0);

  const meals: { id: MealType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'breakfast', label: '早餐 (Breakfast)', icon: <Coffee className="w-4 h-4 text-amber-600" />, color: 'amber' },
    { id: 'lunch', label: '午餐 (Lunch)', icon: <Sun className="w-4 h-4 text-emerald-600" />, color: 'emerald' },
    { id: 'dinner', label: '晚餐 (Dinner)', icon: <Moon className="w-4 h-4 text-blue-600" />, color: 'blue' },
    { id: 'snack', label: '點心/宵夜 (Snack)', icon: <Cookie className="w-4 h-4 text-purple-600" />, color: 'purple' },
  ];

  return (
    <div id="foodlog-view" className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              {formatDateLabel(selectedDate)}
            </span>
            <span className="text-xs text-slate-500 font-medium">每日飲食記錄與成分拆解</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1.5 flex items-center gap-2">
            飲食日記與成分詳細資訊
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            當日紀錄熱量：<strong className="text-emerald-600 font-bold">{totalCalories}</strong> kcal | 
            蛋白質 <strong className="text-blue-600">{totalProtein}g</strong> | 
            碳水 <strong className="text-amber-600">{totalCarbs}g</strong> | 
            脂肪 <strong className="text-rose-600">{totalFat}g</strong>
          </p>
        </div>

        <button
          id="add-food-log-section-btn"
          onClick={onOpenAddModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>新增食物紀錄</span>
        </button>
      </div>

      {/* Quick Select from Favorites Bar */}
      {favoriteFoods.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" /> 一鍵從「常吃食物庫」加入今日飲食：
          </span>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-0.5">
            {favoriteFoods.map((fav) => (
              <button
                key={fav.id || fav.foodName}
                onClick={() => onQuickAddFavoriteFood(fav)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs text-slate-800 hover:text-emerald-700 transition-all flex items-center gap-2 group shadow-2xs"
              >
                <span className="font-semibold">{fav.foodName}</span>
                <span className="text-emerald-600 font-bold text-[11px]">
                  +{fav.calories} kcal
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Meals Grouped Sections */}
      <div className="space-y-4">
        {meals.map((meal) => {
          const mealLogs = foodLogs.filter((f) => f.mealType === meal.id);
          const mealCalories = mealLogs.reduce((sum, item) => sum + item.calories, 0);

          return (
            <div
              key={meal.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs"
            >
              {/* Meal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                    {meal.icon}
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{meal.label}</h3>
                  <span className="text-xs text-slate-500 font-normal">
                    ({mealLogs.length} 項紀錄)
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
                    {mealCalories} kcal
                  </span>
                  <button
                    onClick={onOpenAddModal}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="在此餐別新增紀錄"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Logs List for Meal */}
              {mealLogs.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2 pl-2">
                  尚未登錄{meal.label.split(' ')[0]}餐點，點擊「+」即可記錄。
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {mealLogs.map((log) => (
                    <div
                      key={log.id || log.foodName + log.calories}
                      className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors group text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{log.foodName}</span>
                          {log.servingAmount && (
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
                              {log.servingAmount} {log.servingUnit || '份'}
                            </span>
                          )}
                        </div>

                        {/* Nutrient details */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                          <span>蛋白: <strong className="text-blue-600 font-bold">{log.proteinGrams}g</strong></span>
                          <span>碳水: <strong className="text-amber-600 font-bold">{log.carbsGrams}g</strong></span>
                          <span>脂肪: <strong className="text-rose-600 font-bold">{log.fatGrams}g</strong></span>
                          {log.fiberGrams ? <span>纖維: <strong className="text-emerald-600 font-bold">{log.fiberGrams}g</strong></span> : null}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-extrabold text-amber-600 text-sm">
                          {log.calories} <span className="text-[10px] font-medium text-slate-500">kcal</span>
                        </span>
                        {log.id && (
                          <button
                            onClick={() => onDeleteLog(log.id!)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="刪除紀錄"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
