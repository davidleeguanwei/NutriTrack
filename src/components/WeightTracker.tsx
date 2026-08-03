import React, { useState } from 'react';
import { 
  Scale, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid
} from 'recharts';
import { WeightLog, UserProfile } from '../types';
import { getTodayString } from '../lib/calculator';

interface WeightTrackerProps {
  weightLogs: WeightLog[];
  profile: UserProfile;
  selectedDate: string;
  onSaveWeight: (date: string, weightKg: number, note?: string) => Promise<void>;
  onDeleteWeight: (id: string) => Promise<void>;
}

export const WeightTracker: React.FC<WeightTrackerProps> = ({
  weightLogs,
  profile,
  selectedDate,
  onSaveWeight,
  onDeleteWeight,
}) => {
  const [logDate, setLogDate] = useState(selectedDate || getTodayString());
  const [weightInput, setWeightInput] = useState(profile.weight ? profile.weight.toString() : '');
  const [noteInput, setNoteInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Sorting logs by date ascending for chart
  const sortedLogs = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));

  // Key Statistics
  const latestLog = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1] : null;
  const initialLog = sortedLogs.length > 0 ? sortedLogs[0] : null;

  const currentWeight = latestLog ? latestLog.weightKg : profile.weight || 0;
  const initialWeight = initialLog ? initialLog.weightKg : currentWeight;
  const weightChange = currentWeight && initialWeight ? Math.round((currentWeight - initialWeight) * 10) / 10 : 0;

  const allWeights = sortedLogs.map((l) => l.weightKg);
  const minWeight = allWeights.length > 0 ? Math.min(...allWeights) : currentWeight;
  const maxWeight = allWeights.length > 0 ? Math.max(...allWeights) : currentWeight;

  // BMI Calculation: weight (kg) / (height (m) ^ 2)
  const heightM = profile.height ? profile.height / 100 : 1.65;
  const bmi = currentWeight > 0 ? Math.round((currentWeight / (heightM * heightM)) * 10) / 10 : 0;

  const getBmiCategory = (bmiVal: number) => {
    if (bmiVal < 18.5) return { label: '體重過輕', color: 'text-amber-600' };
    if (bmiVal < 24) return { label: '適中健康範圍', color: 'text-emerald-600' };
    if (bmiVal < 27) return { label: '體重過重', color: 'text-amber-600' };
    return { label: '肥胖等級', color: 'text-rose-600' };
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0 || w > 300) return;

    setSubmitting(true);
    try {
      await onSaveWeight(logDate, w, noteInput);
      setNoteInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="weight-tracker-view" className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Scale className="w-3.5 h-3.5" /> 體重趨勢紀錄
            </span>
            <span className="text-xs text-slate-500 font-medium">不需要每天填，有量即可記錄</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1.5">
            體重變化折線圖與 BMI 評估
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            持續紀錄體重變化趨勢，讓飲食控制與運動減脂成果一目了然！
          </p>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Current Weight */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">最新紀錄體重</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-blue-600">{currentWeight}</span>
            <span className="text-xs text-slate-500">kg</span>
          </div>
          <span className="text-[11px] text-slate-400 block">
            {latestLog ? `更新於 ${latestLog.date}` : '尚未紀錄'}
          </span>
        </div>

        {/* Weight Change */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">累積體重變化</span>
          <div className="flex items-center gap-1.5">
            {weightChange <= 0 ? (
              <TrendingDown className="w-5 h-5 text-emerald-600" />
            ) : (
              <TrendingUp className="w-5 h-5 text-rose-600" />
            )}
            <span className={`text-3xl font-extrabold ${weightChange <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {weightChange > 0 ? `+${weightChange}` : weightChange}
            </span>
            <span className="text-xs text-slate-500">kg</span>
          </div>
          <span className="text-[11px] text-slate-400 block">對比首筆體重紀錄</span>
        </div>

        {/* BMI */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">身體質量指數 (BMI)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-purple-600">{bmi}</span>
          </div>
          <span className={`text-[11px] font-bold block ${getBmiCategory(bmi).color}`}>
            {getBmiCategory(bmi).label}
          </span>
        </div>

        {/* Min / Max Range */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
          <span className="text-xs text-slate-500 font-medium block">歷史最高與最低</span>
          <div className="flex justify-between items-center text-xs pt-1">
            <span className="text-emerald-600 font-bold">最低: {minWeight} kg</span>
            <span className="text-amber-600 font-bold">最高: {maxWeight} kg</span>
          </div>
          <span className="text-[11px] text-slate-400 block pt-1">區間波動 {(maxWeight - minWeight).toFixed(1)} kg</span>
        </div>
      </div>

      {/* Main Content: Chart & Log Input */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recharts Weight Line Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">體重歷史趨勢圖</h3>
            </div>
            <span className="text-xs text-slate-500">包含近 {sortedLogs.length} 次紀錄</span>
          </div>

          {sortedLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Scale className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-medium text-slate-500">尚無體重紀錄，歡迎在右側表單新增第一筆體重！</p>
            </div>
          ) : (
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sortedLogs} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    tick={{ fontSize: 11 }} 
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    stroke="#64748b" 
                    tick={{ fontSize: 11 }} 
                    unit="kg"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#cbd5e1',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#0f172a',
                      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weightKg"
                    name="體重 (kg)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Log Weight Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Plus className="w-5 h-5 text-emerald-600" /> 紀錄體重數據
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">可選擇任意日期進行登錄</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-slate-900 font-bold block">紀錄日期</label>
              <input
                id="weight-log-date-input"
                type="date"
                required
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-900 font-bold block">體重 (公斤 kg) <span className="text-rose-500">*</span></label>
              <input
                id="weight-log-kg-input"
                type="number"
                step="0.1"
                required
                placeholder="例如：62.5"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-900 font-bold block">備註說明 (選填)</label>
              <input
                id="weight-log-note-input"
                type="text"
                placeholder="例如：空腹晨量、運動後"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:bg-white"
              />
            </div>

            <button
              id="submit-weight-log-btn"
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-all"
            >
              {submitting ? '儲存中...' : '儲存體重紀錄'}
            </button>
          </form>

          {/* History List */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-700 block">歷史紀錄明細</span>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {sortedLogs.slice().reverse().map((log) => (
                <div
                  key={log.id || log.date}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-800">{log.date}</span>
                    {log.note && <span className="text-[11px] text-slate-500 block">{log.note}</span>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-blue-600">{log.weightKg} kg</span>
                    {log.id && (
                      <button
                        onClick={() => onDeleteWeight(log.id!)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="刪除這筆紀錄"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
