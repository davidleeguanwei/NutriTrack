import React from 'react';
import { User } from 'firebase/auth';
import { 
  Flame, 
  Droplet, 
  Scale, 
  Calendar, 
  LogOut, 
  LogIn, 
  UtensilsCrossed, 
  Heart, 
  Settings, 
  LayoutDashboard
} from 'lucide-react';
import { formatDateLabel, getTodayString } from '../lib/calculator';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  onGoogleSignIn: () => void;
  onGuestSignIn: () => void;
  onSignOut: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  selectedDate,
  setSelectedDate,
  onGoogleSignIn,
  onGuestSignIn,
  onSignOut,
}) => {
  const isToday = selectedDate === getTodayString();

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <button 
              id="brand-logo-button"
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center space-x-2 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-xs group-hover:bg-emerald-600 transition-colors">
                <Flame className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  NutriTrack
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold">
                    熱量日誌
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 block -mt-1 font-sans">
                  健康飲食與體重管理
                </span>
              </div>
            </button>
          </div>

          {/* Date Selector */}
          <div className="hidden md:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 space-x-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <input
              id="header-date-input"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-slate-700 focus:outline-none font-semibold cursor-pointer"
            />
            <span className="text-xs text-emerald-700 font-bold px-2 py-0.5 rounded bg-emerald-100/60">
              {formatDateLabel(selectedDate)}
            </span>
            {!isToday && (
              <button
                id="reset-today-btn"
                onClick={() => setSelectedDate(getTodayString())}
                className="text-xs text-slate-500 hover:text-emerald-600 underline ml-1 font-medium"
              >
                回到今天
              </button>
            )}
          </div>

          {/* User Auth Info */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded-full py-1 px-3">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="Avatar" 
                      className="w-6 h-6 rounded-full border border-slate-300" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-bold text-white">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-700 max-w-[100px] truncate">
                    {user.isAnonymous ? '訪客帳號' : (user.displayName || user.email?.split('@')[0])}
                  </span>
                </div>
                <button
                  id="signout-button"
                  onClick={onSignOut}
                  title="登出帳號"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  id="google-signin-button"
                  onClick={onGoogleSignIn}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-all shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Google 登入</span>
                </button>
                <button
                  id="guest-signin-button"
                  onClick={onGuestSignIn}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                >
                  訪客試用
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav id="nav-tab-menu" className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-100">
          <button
            id="nav-tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>儀表板</span>
          </button>

          <button
            id="nav-tab-foodlog"
            onClick={() => setActiveTab('foodlog')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'foodlog'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>飲食紀錄</span>
          </button>

          <button
            id="nav-tab-favorites"
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'favorites'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>常吃食物庫</span>
          </button>

          <button
            id="nav-tab-weight"
            onClick={() => setActiveTab('weight')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'weight'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Scale className="w-4 h-4 text-blue-500" />
            <span>體重趨勢</span>
          </button>

          <button
            id="nav-tab-water"
            onClick={() => setActiveTab('water')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'water'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Droplet className="w-4 h-4 text-blue-500" />
            <span>喝水紀錄</span>
          </button>

          <button
            id="nav-tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'settings'
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Settings className="w-4 h-4 text-purple-500" />
            <span>BMR/TDEE 個人設定</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
