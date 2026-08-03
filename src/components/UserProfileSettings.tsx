import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Target, 
  Activity, 
  Save, 
  Info, 
  Calculator,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { UserProfile, Gender, ActivityLevel } from '../types';
import { calculateBMR, calculateTDEE, ACTIVITY_LEVEL_LABELS } from '../lib/calculator';

interface UserProfileSettingsProps {
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => Promise<void>;
}

export const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({
  profile,
  onSaveProfile,
}) => {
  const [gender, setGender] = useState<Gender>(profile.gender || 'female');
  const [age, setAge] = useState<string>(profile.age ? profile.age.toString() : '28');
  const [height, setHeight] = useState<string>(profile.height ? profile.height.toString() : '165');
  const [weight, setWeight] = useState<string>(profile.weight ? profile.weight.toString() : '58');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activityLevel || 'light');

  const [useCustomTarget, setUseCustomTarget] = useState<boolean>(profile.useCustomTarget || false);
  const [customTargetInput, setCustomTargetInput] = useState<string>(
    profile.customCalorieTarget ? profile.customCalorieTarget.toString() : '1800'
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live calculation preview
  const numAge = parseInt(age, 10) || 28;
  const numHeight = parseFloat(height) || 165;
  const numWeight = parseFloat(weight) || 58;

  const calculatedBmr = calculateBMR(gender, numWeight, numHeight, numAge);
  const calculatedTdee = calculateTDEE(calculatedBmr, activityLevel);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const updatedProfile: UserProfile = {
        ...profile,
        gender,
        age: numAge,
        height: numHeight,
        weight: numWeight,
        activityLevel,
        bmr: calculatedBmr,
        tdee: calculatedTdee,
        useCustomTarget,
        customCalorieTarget: parseFloat(customTargetInput) || calculatedTdee,
        updatedAt: new Date().toISOString(),
      };

      await onSaveProfile(updatedProfile);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="settings-view" className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" /> 身體數據與 BMR / TDEE 計算器
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1.5">
            個人身體檔案與每日卡路里上限設定
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            輸入您的年齡、身高、體重與活動量，自動為您精算 BMR (基礎代謝率) 與 TDEE (每日總熱量消耗)。
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>個人身體數據與 BMR/TDEE 計算成果已成功儲存！儀表板數據已同步更新。</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Section 1: Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <UserIcon className="w-4 h-4 text-emerald-600" /> 基本身體數值
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-slate-900 font-bold block">生理性別</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        gender === 'male'
                          ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      男性
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-2 rounded-xl font-bold border transition-all ${
                        gender === 'female'
                          ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      女性
                    </button>
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-1.5">
                  <label className="text-slate-900 font-bold block">年齡 (歲)</label>
                  <input
                    id="settings-age-input"
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Height */}
                <div className="space-y-1.5">
                  <label className="text-slate-900 font-bold block">身高 (公分 cm)</label>
                  <input
                    id="settings-height-input"
                    type="number"
                    required
                    min="50"
                    max="250"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-slate-900 font-bold block">體重 (公斤 kg)</label>
                  <input
                    id="settings-weight-input"
                    type="number"
                    step="0.1"
                    required
                    min="20"
                    max="300"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Activity Level */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Activity className="w-4 h-4 text-amber-600" /> 選擇每日運動與活動量 (影響 TDEE)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
                {(Object.keys(ACTIVITY_LEVEL_LABELS) as ActivityLevel[]).map((levelKey) => {
                  const item = ACTIVITY_LEVEL_LABELS[levelKey];
                  const isSelected = activityLevel === levelKey;

                  return (
                    <button
                      key={levelKey}
                      type="button"
                      onClick={() => setActivityLevel(levelKey)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50/80 border-amber-300 text-amber-900 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100/50'
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold text-slate-900 mb-0.5">
                        <span>{item.label}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono">
                          x{item.factor}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Custom Target Calorie Limit */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Target className="w-4 h-4 text-rose-600" /> 自定義每日熱量最高上限 (選填)
              </h3>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 text-xs">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    id="settings-custom-target-checkbox"
                    type="checkbox"
                    checked={useCustomTarget}
                    onChange={(e) => setUseCustomTarget(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 bg-white border-slate-300"
                  />
                  <span className="text-slate-800 font-bold">
                    啟用自定義熱量上限 (覆蓋系統預設計算之 TDEE，適合增肌赤字/減脂目標)
                  </span>
                </label>

                {useCustomTarget && (
                  <div className="space-y-1.5 pl-7">
                    <label className="text-slate-900 font-bold block">每日自定義熱量目標 (kcal)</label>
                    <input
                      id="settings-custom-target-input"
                      type="number"
                      value={customTargetInput}
                      onChange={(e) => setCustomTargetInput(e.target.value)}
                      placeholder={`例如：${calculatedTdee - 300}`}
                      className="w-full max-w-xs bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-rose-500 font-bold text-sm"
                    />
                    <span className="text-[11px] text-slate-500 block">
                      例如：若欲減脂，可將上限設為 TDEE ({calculatedTdee}) 減 300 kcal 即為 {calculatedTdee - 300} kcal。
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                id="save-profile-settings-btn"
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? '計算並儲存中...' : '儲存個人設定並更新目標數值'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Real-time Calculation Result Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs h-fit">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" /> 即時精算結果預覽
            </h3>
            <p className="text-xs text-slate-500">依據 Mifflin-St Jeor 公式推算</p>
          </div>

          {/* BMR Result Card */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-4 space-y-1">
            <span className="text-xs text-amber-800 font-bold block">基礎代謝率 (BMR)</span>
            <span className="text-3xl font-black text-amber-700">
              {calculatedBmr} <span className="text-xs font-normal text-slate-500">kcal/天</span>
            </span>
            <p className="text-[11px] text-slate-600 pt-1 border-t border-amber-200/60">
              躺在一整天完全不活動時，您心臟跳動與大腦器官運作所消耗的固定卡路里。
            </p>
          </div>

          {/* TDEE Result Card */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 space-y-1">
            <span className="text-xs text-emerald-800 font-bold block">每日總熱量消耗 (TDEE)</span>
            <span className="text-3xl font-black text-emerald-700">
              {calculatedTdee} <span className="text-xs font-normal text-slate-500">kcal/天</span>
            </span>
            <p className="text-[11px] text-slate-600 pt-1 border-t border-emerald-200/60">
              包含日常走動、工作與運動的總卡路里消耗量。若無特定增肌減脂需求，維持此熱量體重將保持平穩。
            </p>
          </div>

          {/* Target Limit Status Card */}
          <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-4 space-y-1">
            <span className="text-xs text-purple-800 font-bold block">儀表板最終採用最高熱量上限</span>
            <span className="text-2xl font-extrabold text-purple-700">
              {useCustomTarget ? (parseFloat(customTargetInput) || calculatedTdee) : calculatedTdee} kcal
            </span>
            <span className="text-[11px] text-slate-500 block">
              {useCustomTarget ? '（使用者自定義上限模式）' : '（標準 TDEE 模式）'}
            </span>
          </div>

          {/* Explanation Notes */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-600" /> 計算公式說明
            </span>
            <p>• 男性 BMR = 10 × 體重(kg) + 6.25 × 身高(cm) - 5 × 年齡 + 5</p>
            <p>• 女性 BMR = 10 × 體重(kg) + 6.25 × 身高(cm) - 5 × 年齡 - 161</p>
            <p>• TDEE = BMR × 活動量加權係數 (1.2 ~ 1.9)</p>
          </div>
        </div>

      </div>
    </div>
  );
};
