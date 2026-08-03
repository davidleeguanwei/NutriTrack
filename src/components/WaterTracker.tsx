import React, { useState } from 'react';
import { 
  Droplet, 
  Plus, 
  Minus, 
  Settings, 
  Award,
  Sparkles
} from 'lucide-react';
import { WaterLog, UserProfile } from '../types';

interface WaterTrackerProps {
  waterLog: WaterLog;
  profile: UserProfile;
  selectedDate: string;
  onUpdateWaterCups: (cups: number) => Promise<void>;
  onUpdateWaterSettings: (cupVolumeMl: number, dailyCupsTarget: number) => Promise<void>;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  waterLog,
  profile,
  selectedDate,
  onUpdateWaterCups,
  onUpdateWaterSettings,
}) => {
  const [cupVolumeInput, setCupVolumeInput] = useState(
    profile.waterCupVolumeMl ? profile.waterCupVolumeMl.toString() : '250'
  );
  const [dailyCupsInput, setDailyCupsInput] = useState(
    profile.waterDailyCupsTarget ? profile.waterDailyCupsTarget.toString() : '8'
  );

  const [savingSettings, setSavingSettings] = useState(false);

  const currentCups = waterLog.cups || 0;
  const cupVolume = profile.waterCupVolumeMl || 250;
  const targetCups = profile.waterDailyCupsTarget || 8;

  const currentTotalMl = currentCups * cupVolume;
  const targetTotalMl = targetCups * cupVolume;
  const progressPct = Math.min(100, Math.round((currentTotalMl / targetTotalMl) * 100));
  const isGoalReached = currentTotalMl >= targetTotalMl;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const vol = parseInt(cupVolumeInput, 10);
    const target = parseInt(dailyCupsInput, 10);
    if (isNaN(vol) || isNaN(target) || vol <= 0 || target <= 0) return;

    setSavingSettings(true);
    try {
      await onUpdateWaterSettings(vol, target);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div id="water-tracker-view" className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Droplet className="w-3.5 h-3.5 fill-sky-600 text-sky-600" /> 水分攝取紀錄
            </span>
            <span className="text-xs text-slate-500 font-medium">日期：{selectedDate}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1.5">
            每日飲水量追蹤儀表板
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            充足水分能提高基礎代謝率並協助排毒與新陳代謝！
          </p>
        </div>

        {isGoalReached && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
            <Award className="w-5 h-5 text-emerald-600" />
            <span>今日飲水目標成功達標！恭喜！</span>
          </div>
        )}
      </div>

      {/* Grid: Main Water Glass Card & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Interactive Water Glass Counter & Cup Grid */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Droplet className="w-5 h-5 text-sky-600 fill-sky-100" /> 今日飲水進度
              </h2>
              <p className="text-xs text-slate-500">目前設定每杯 {cupVolume} ml</p>
            </div>

            <div className="text-right">
              <span className="text-3xl font-extrabold text-sky-600">
                {currentTotalMl} <span className="text-xs font-medium text-slate-500">/ {targetTotalMl} ml</span>
              </span>
              <span className="text-xs text-sky-700 font-bold block">{progressPct}% 達成率</span>
            </div>
          </div>

          {/* Large Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div 
                className="h-full bg-sky-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium px-1">
              <span>0 ml</span>
              <span>目標: {targetTotalMl} ml ({targetCups} 杯)</span>
            </div>
          </div>

          {/* Interactive Cups Grid */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-800 block">
              點擊杯子即可切換喝水狀態 (現已喝 {currentCups} 杯)：
            </span>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {Array.from({ length: Math.max(targetCups, currentCups) }).map((_, index) => {
                const cupNumber = index + 1;
                const isFilled = cupNumber <= currentCups;

                return (
                  <button
                    key={cupNumber}
                    onClick={() => {
                      if (isFilled && cupNumber === currentCups) {
                        onUpdateWaterCups(currentCups - 1);
                      } else {
                        onUpdateWaterCups(cupNumber);
                      }
                    }}
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 border transition-all transform hover:scale-105 cursor-pointer ${
                      isFilled
                        ? 'bg-sky-50 border-sky-300 text-sky-700 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                    title={`第 ${cupNumber} 杯 (${cupVolume} ml)`}
                  >
                    <Droplet className={`w-6 h-6 ${isFilled ? 'fill-sky-500 text-sky-500' : 'text-slate-300'}`} />
                    <span className="text-[10px] font-bold mt-1">#{cupNumber}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Counter Buttons */}
          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-slate-100">
            <button
              id="water-minus-btn"
              onClick={() => onUpdateWaterCups(Math.max(0, currentCups - 1))}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Minus className="w-4 h-4" />
              <span>減少 1 杯 (-{cupVolume} ml)</span>
            </button>

            <button
              id="water-plus-btn"
              onClick={() => onUpdateWaterCups(currentCups + 1)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>增加 1 杯 (+{cupVolume} ml)</span>
            </button>
          </div>
        </div>

        {/* Card 2: Water Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-4 h-4 text-emerald-600" /> 自定義喝水容量與目標
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">根據容器與習慣調整設定</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-900 font-bold block">每杯容量 (毫升 ml)</label>
              <input
                id="water-volume-input"
                type="number"
                required
                placeholder="例如：250"
                value={cupVolumeInput}
                onChange={(e) => setCupVolumeInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 block">一般馬克杯約 250ml，保溫瓶約 500ml</span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-900 font-bold block">每日目標總杯數 (杯)</label>
              <input
                id="water-target-cups-input"
                type="number"
                required
                placeholder="例如：8"
                value={dailyCupsInput}
                onChange={(e) => setDailyCupsInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 block">
                目標總估算: {parseInt(cupVolumeInput || '0', 10) * parseInt(dailyCupsInput || '0', 10)} ml
              </span>
            </div>

            <button
              id="save-water-settings-btn"
              type="submit"
              disabled={savingSettings}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs"
            >
              {savingSettings ? '儲存中...' : '更新喝水目標設定'}
            </button>
          </form>

          {/* Water Health Tips */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <span className="font-bold text-emerald-700 block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> 健康飲水小提示
            </span>
            <p>1. 早上起床喝 1 杯溫開水能喚醒消化器官與新陳代謝。</p>
            <p>2. 餐前 30 分鐘喝水有助於增加飽足感，避免過度攝取卡路里。</p>
            <p>3. 運動過程中每 15-20 分鐘補充適量水分。</p>
          </div>
        </div>

      </div>
    </div>
  );
};
