import React, { useState } from 'react';
import { X, Plus, Heart, Sparkles, Utensils } from 'lucide-react';
import { FoodLog, MealType, FavoriteFood } from '../types';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType: MealType;
  selectedDate: string;
  favoriteFoods: FavoriteFood[];
  onAddFood: (foodLog: Omit<FoodLog, 'id'>, saveToFavorites: boolean) => Promise<void>;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  defaultMealType,
  selectedDate,
  favoriteFoods,
  onAddFood,
}) => {
  if (!isOpen) return null;

  React.useEffect(() => {
    if (isOpen) {
      setMealType(defaultMealType);
    }
  }, [isOpen, defaultMealType]);

  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<string>('');
  const [proteinGrams, setProteinGrams] = useState<string>('0');
  const [carbsGrams, setCarbsGrams] = useState<string>('0');
  const [fatGrams, setFatGrams] = useState<string>('0');
  const [fiberGrams, setFiberGrams] = useState<string>('0');
  const [servingAmount, setServingAmount] = useState<string>('1');
  const [servingUnit, setServingUnit] = useState('份');
  const [saveToFavorites, setSaveToFavorites] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchFav, setSearchFav] = useState('');

  const handleSelectFavorite = (fav: FavoriteFood) => {
    setFoodName(fav.foodName);
    setCalories(fav.calories.toString());
    setProteinGrams(fav.proteinGrams.toString());
    setCarbsGrams(fav.carbsGrams.toString());
    setFatGrams(fav.fatGrams.toString());
    if (fav.defaultServingUnit) {
      setServingUnit(fav.defaultServingUnit);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim() || !calories) return;

    setSubmitting(true);
    try {
      await onAddFood(
        {
          userId: '', // set in handler
          date: selectedDate,
          mealType,
          foodName: foodName.trim(),
          calories: parseFloat(calories) || 0,
          proteinGrams: parseFloat(proteinGrams) || 0,
          carbsGrams: parseFloat(carbsGrams) || 0,
          fatGrams: parseFloat(fatGrams) || 0,
          fiberGrams: parseFloat(fiberGrams) || 0,
          servingAmount: parseFloat(servingAmount) || 1,
          servingUnit,
        },
        saveToFavorites
      );
      onClose();
      // Reset
      setFoodName('');
      setCalories('');
      setProteinGrams('0');
      setCarbsGrams('0');
      setFatGrams('0');
      setFiberGrams('0');
      setSaveToFavorites(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFavs = favoriteFoods.filter((f) =>
    f.foodName.toLowerCase().includes(searchFav.toLowerCase())
  );

  return (
    <div id="add-food-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-xl relative animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">新增飲食熱量紀錄</h2>
              <p className="text-xs text-slate-500">日期：{selectedDate}</p>
            </div>
          </div>

          <button
            id="close-add-food-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Pick from Favorites */}
        {favoriteFoods.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 從常吃食物快速套用：
              </span>
              <input
                id="modal-search-fav"
                type="text"
                placeholder="搜尋常吃食物..."
                value={searchFav}
                onChange={(e) => setSearchFav(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-0.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-[90px] overflow-y-auto pr-1">
              {filteredFavs.slice(0, 10).map((fav) => (
                <button
                  key={fav.id || fav.foodName}
                  type="button"
                  onClick={() => handleSelectFavorite(fav)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs text-slate-800 hover:text-emerald-700 transition-all flex items-center gap-1.5 shadow-2xs"
                >
                  <span className="font-semibold">{fav.foodName}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">{fav.calories}k</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Meal Type Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-900 font-bold block">選擇餐別</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'breakfast', label: '早餐' },
                { id: 'lunch', label: '午餐' },
                { id: 'dinner', label: '晚餐' },
                { id: 'snack', label: '點心/宵夜' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMealType(m.id as MealType)}
                  className={`py-2 px-3 rounded-xl font-bold border transition-all ${mealType === m.id
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Food Name & Calories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-900 font-bold block">食物名稱 <span className="text-rose-500">*</span></label>
              <input
                id="food-name-input"
                type="text"
                required
                placeholder="例如：雞腿便當、無糖黑咖啡"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-900 font-bold block">熱量 (大卡 / kcal) <span className="text-rose-500">*</span></label>
              <input
                id="food-calories-input"
                type="number"
                step="0.1"
                required
                placeholder="例如：550"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Macronutrients */}
          <div className="space-y-1.5 pt-1">
            <label className="text-slate-900 font-bold block">營養成分 (公克 / g)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-blue-100">
                <span className="text-blue-600 font-bold block">蛋白質 (g)</span>
                <input
                  id="food-protein-input"
                  type="number"
                  step="0.1"
                  value={proteinGrams}
                  onChange={(e) => setProteinGrams(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-amber-100">
                <span className="text-amber-600 font-bold block">澱粉/碳水 (g)</span>
                <input
                  id="food-carbs-input"
                  type="number"
                  step="0.1"
                  value={carbsGrams}
                  onChange={(e) => setCarbsGrams(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-rose-100">
                <span className="text-rose-600 font-bold block">脂肪 (g)</span>
                <input
                  id="food-fat-input"
                  type="number"
                  step="0.1"
                  value={fatGrams}
                  onChange={(e) => setFatGrams(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-emerald-100">
                <span className="text-emerald-600 font-bold block">纖維 (g)</span>
                <input
                  id="food-fiber-input"
                  type="number"
                  step="0.1"
                  value={fiberGrams}
                  onChange={(e) => setFiberGrams(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Portion Unit & Save To Favorites Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center pt-1">
            <div className="flex gap-2">
              <div className="w-1/2 space-y-1">
                <label className="text-slate-600 font-semibold block">份量數</label>
                <input
                  type="number"
                  step="0.1"
                  value={servingAmount}
                  onChange={(e) => setServingAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:bg-white"
                />
              </div>
              <div className="w-1/2 space-y-1">
                <label className="text-slate-600 font-semibold block">單位</label>
                <input
                  type="text"
                  placeholder="份 / 碗 / 100g"
                  value={servingUnit}
                  onChange={(e) => setServingUnit(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-slate-900 focus:bg-white"
                />
              </div>
            </div>

            <label className="flex items-center space-x-2 cursor-pointer bg-slate-50 border border-slate-200 p-2.5 rounded-xl hover:border-emerald-300 transition-colors">
              <input
                type="checkbox"
                checked={saveToFavorites}
                onChange={(e) => setSaveToFavorites(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 bg-white border-slate-300"
              />
              <span className="text-slate-800 font-medium flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" /> 同時存入常吃食物庫
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
            >
              取消
            </button>
            <button
              id="submit-add-food-btn"
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              {submitting ? '儲存中...' : (
                <>
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>確定新增紀錄</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
