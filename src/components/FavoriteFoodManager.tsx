import React, { useState } from 'react';
import { 
  Heart, 
  Plus, 
  Search, 
  Trash2, 
  Check, 
  X
} from 'lucide-react';
import { FavoriteFood, MealType } from '../types';

interface FavoriteFoodManagerProps {
  favoriteFoods: FavoriteFood[];
  onAddFavorite: (fav: Omit<FavoriteFood, 'id'>) => Promise<void>;
  onDeleteFavorite: (id: string) => Promise<void>;
  onLogFavoriteToDate: (fav: FavoriteFood, mealType: MealType) => Promise<void>;
}

export const FavoriteFoodManager: React.FC<FavoriteFoodManagerProps> = ({
  favoriteFoods,
  onAddFavorite,
  onDeleteFavorite,
  onLogFavoriteToDate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states for new favorite food
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [proteinGrams, setProteinGrams] = useState('0');
  const [carbsGrams, setCarbsGrams] = useState('0');
  const [fatGrams, setFatGrams] = useState('0');
  const [defaultServingUnit, setDefaultServingUnit] = useState('1 份');
  const [category, setCategory] = useState('高蛋白質');
  const [submitting, setSubmitting] = useState(false);

  // Selected meal for quick logging
  const [quickMealType, setQuickMealType] = useState<MealType>('lunch');
  const [loggedNotification, setLoggedNotification] = useState<string | null>(null);

  const categories = ['all', '高蛋白質', '全穀雜糧', '蔬菜水果', '飲料', '健康點心', '其他'];

  const filteredFoods = favoriteFoods.filter((f) => {
    const matchesSearch = f.foodName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || !calories) return;

    setSubmitting(true);
    try {
      await onAddFavorite({
        userId: '',
        foodName: foodName.trim(),
        calories: parseFloat(calories) || 0,
        proteinGrams: parseFloat(proteinGrams) || 0,
        carbsGrams: parseFloat(carbsGrams) || 0,
        fatGrams: parseFloat(fatGrams) || 0,
        defaultServingUnit,
        category,
      });

      // Reset
      setFoodName('');
      setCalories('');
      setProteinGrams('0');
      setCarbsGrams('0');
      setFatGrams('0');
      setIsAddOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLog = async (fav: FavoriteFood) => {
    try {
      await onLogFavoriteToDate(fav, quickMealType);
      setLoggedNotification(`已新增 ${fav.foodName} 到今日 ${
        quickMealType === 'breakfast' ? '早餐' : quickMealType === 'lunch' ? '午餐' : quickMealType === 'dinner' ? '晚餐' : '點心'
      }`);
      setTimeout(() => setLoggedNotification(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div id="favorite-foods-view" className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" /> 常吃食物單
            </span>
            <span className="text-xs text-slate-500 font-medium">儲存日常高頻率餐點</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1.5">
            常吃食物庫與一鍵紀錄
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            自定義預設食物與卡路里，未來一鍵即可直接代入每日飲食日記，大幅節省時間！
          </p>
        </div>

        <button
          id="open-add-favorite-modal-btn"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>建立新常吃食物</span>
        </button>
      </div>

      {/* Notification Toast */}
      {loggedNotification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{loggedNotification}</span>
        </div>
      )}

      {/* Search & Category Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="search-favorite-input"
              type="text"
              placeholder="搜尋常吃食物名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
            />
          </div>

          {/* Meal Type selector for quick logging */}
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-600 font-semibold">快速紀錄至：</span>
            <select
              value={quickMealType}
              onChange={(e) => setQuickMealType(e.target.value as MealType)}
              className="bg-white text-emerald-700 font-bold focus:outline-none cursor-pointer rounded border border-slate-300 px-1.5 py-0.5"
            >
              <option value="breakfast">早餐</option>
              <option value="lunch">午餐</option>
              <option value="dinner">晚餐</option>
              <option value="snack">點心/宵夜</option>
            </select>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {cat === 'all' ? '全部種類' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Favorite Foods */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.map((fav) => (
          <div
            key={fav.id || fav.foodName}
            className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 space-y-3 shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">{fav.foodName}</h3>
                    {fav.category && (
                      <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full font-semibold">
                        {fav.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">標準份量：{fav.defaultServingUnit || '1 份'}</p>
                </div>

                <span className="text-lg font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                  {fav.calories} <span className="text-xs font-medium text-slate-500">kcal</span>
                </span>
              </div>

              {/* Macro stats */}
              <div className="grid grid-cols-3 gap-2 mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600">
                <div className="text-center">
                  <span className="text-blue-600 font-bold block">{fav.proteinGrams}g</span>
                  <span className="text-[10px] text-slate-400">蛋白質</span>
                </div>
                <div className="text-center">
                  <span className="text-amber-600 font-bold block">{fav.carbsGrams}g</span>
                  <span className="text-[10px] text-slate-400">澱粉/碳水</span>
                </div>
                <div className="text-center">
                  <span className="text-rose-600 font-bold block">{fav.fatGrams}g</span>
                  <span className="text-[10px] text-slate-400">脂肪</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {fav.id && (
                <button
                  onClick={() => onDeleteFavorite(fav.id!)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="從常吃食物庫移除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => handleQuickLog(fav)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-2xs ml-auto"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>加入今日飲食</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Favorite Food Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-600 fill-rose-100" /> 新增至常吃食物庫
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-900 font-bold block">食物名稱</label>
                  <input
                    type="text"
                    required
                    placeholder="例如：地瓜、黑咖啡"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-900 font-bold block">卡路里 (kcal)</label>
                  <input
                    type="number"
                    required
                    placeholder="例如：140"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-blue-100">
                  <span className="text-blue-600 font-bold block">蛋白質 (g)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={proteinGrams}
                    onChange={(e) => setProteinGrams(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-amber-100">
                  <span className="text-amber-600 font-bold block">澱粉/碳水 (g)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={carbsGrams}
                    onChange={(e) => setCarbsGrams(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 text-xs"
                  />
                </div>

                <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-rose-100">
                  <span className="text-rose-600 font-bold block">脂肪 (g)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={fatGrams}
                    onChange={(e) => setFatGrams(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-900 font-bold block">標準預設單位</label>
                  <input
                    type="text"
                    value={defaultServingUnit}
                    onChange={(e) => setDefaultServingUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-900 font-bold block">食物分類</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:bg-white"
                  >
                    <option value="高蛋白質">高蛋白質</option>
                    <option value="全穀雜糧">全穀雜糧</option>
                    <option value="蔬菜水果">蔬菜水果</option>
                    <option value="飲料">飲料</option>
                    <option value="健康點心">健康點心</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  {submitting ? '儲存中...' : '儲存至常吃庫'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
