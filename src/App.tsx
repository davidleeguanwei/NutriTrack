import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  auth, 
  loginWithGoogle, 
  loginAsGuest, 
  logoutUser 
} from './lib/firebase';
import { 
  getUserProfile, 
  saveUserProfile, 
  getFoodLogsForDate, 
  addFoodLog, 
  deleteFoodLog, 
  getWeightLogs, 
  saveWeightLog, 
  deleteWeightLog, 
  getWaterLogForDate, 
  updateWaterLog, 
  getFavoriteFoods, 
  addFavoriteFood, 
  deleteFavoriteFood 
} from './lib/firestoreService';

import { UserProfile, FoodLog, WeightLog, WaterLog, FavoriteFood, MealType } from './types';
import { DEFAULT_USER_PROFILE, getTodayString } from './lib/calculator';

import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { FoodLogSection } from './components/FoodLogSection';
import { WeightTracker } from './components/WeightTracker';
import { WaterTracker } from './components/WaterTracker';
import { FavoriteFoodManager } from './components/FavoriteFoodManager';
import { UserProfileSettings } from './components/UserProfileSettings';
import { AddFoodModal } from './components/AddFoodModal';

import { Flame, Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  // App navigation and active date
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());

  // Firestore Data States
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [waterLog, setWaterLog] = useState<WaterLog>({
    userId: '',
    date: selectedDate,
    cups: 0,
    cupVolumeMl: 250,
    totalMl: 0,
  });
  const [favoriteFoods, setFavoriteFoods] = useState<FavoriteFood[]>([]);

  // Modal State
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Listen for Auth status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (!currentUser) {
        // Auto-signin as guest for seamless immediate preview if not signed in
        try {
          await loginAsGuest();
        } catch (err) {
          console.warn('Guest sign-in fallback error:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch User Data when User or selectedDate changes
  const loadUserData = async () => {
    if (!user) return;
    setDataLoading(true);
    setErrorMessage(null);

    try {
      // Load Profile
      const prof = await getUserProfile(user.uid);
      setProfile(prof);

      // Load Food Logs for selectedDate
      const foods = await getFoodLogsForDate(user.uid, selectedDate);
      setFoodLogs(foods);

      // Load Weight Logs
      const weights = await getWeightLogs(user.uid);
      setWeightLogs(weights);

      // Load Water Log for selectedDate
      const water = await getWaterLogForDate(user.uid, selectedDate, prof.waterCupVolumeMl || 250);
      setWaterLog(water);

      // Load Favorite Foods
      const favs = await getFavoriteFoods(user.uid);
      setFavoriteFoods(favs);
    } catch (err: any) {
      console.error('Error loading user data:', err);
      setErrorMessage('資料載入發生異常，請重試。');
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, selectedDate]);

  // Auth Action Handlers
  const handleGoogleSignIn = async () => {
    try {
      setErrorMessage(null);
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Google 登入失敗');
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setErrorMessage(null);
      await loginAsGuest();
    } catch (err: any) {
      console.error(err);
      setErrorMessage('訪客登入失敗');
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err: any) {
      console.error(err);
    }
  };

  // Data Action Handlers
  const handleAddFoodLog = async (
    foodData: Omit<FoodLog, 'id'>, 
    saveToFavorites: boolean
  ) => {
    if (!user) return;
    try {
      const logToAdd = { ...foodData, userId: user.uid };
      const newId = await addFoodLog(logToAdd);
      
      // Update local state
      setFoodLogs((prev) => [...prev, { ...logToAdd, id: newId }]);

      // If requested, save to favorite foods
      if (saveToFavorites) {
        const favData = {
          userId: user.uid,
          foodName: foodData.foodName,
          calories: foodData.calories,
          proteinGrams: foodData.proteinGrams,
          carbsGrams: foodData.carbsGrams,
          fatGrams: foodData.fatGrams,
          defaultServingUnit: `${foodData.servingAmount || 1} ${foodData.servingUnit || '份'}`,
        };
        const favId = await addFavoriteFood(favData);
        setFavoriteFoods((prev) => [...prev, { ...favData, id: favId }]);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('新增食物失敗');
    }
  };

  const handleDeleteFoodLog = async (logId: string) => {
    try {
      await deleteFoodLog(logId);
      setFoodLogs((prev) => prev.filter((item) => item.id !== logId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateWaterCups = async (newCups: number) => {
    if (!user) return;
    const safeCups = Math.max(0, newCups);
    const volume = profile.waterCupVolumeMl || 250;
    try {
      await updateWaterLog(user.uid, selectedDate, safeCups, volume);
      setWaterLog((prev) => ({
        ...prev,
        cups: safeCups,
        totalMl: safeCups * volume,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateWaterSettings = async (cupVolumeMl: number, dailyCupsTarget: number) => {
    if (!user) return;
    try {
      const updatedProfile = {
        ...profile,
        waterCupVolumeMl: cupVolumeMl,
        waterDailyCupsTarget: dailyCupsTarget,
      };
      await saveUserProfile(updatedProfile);
      setProfile(updatedProfile);

      // Also refresh current water log totalMl calculation
      setWaterLog((prev) => ({
        ...prev,
        cupVolumeMl,
        totalMl: prev.cups * cupVolumeMl,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveWeight = async (date: string, weightKg: number, note = '') => {
    if (!user) return;
    try {
      await saveWeightLog(user.uid, date, weightKg, note);
      
      // Update profile latest weight if logging for today or newest date
      if (date >= selectedDate) {
        const updatedProfile = { ...profile, weight: weightKg };
        await saveUserProfile(updatedProfile);
        setProfile(updatedProfile);
      }

      // Refresh weight logs
      const updatedLogs = await getWeightLogs(user.uid);
      setWeightLogs(updatedLogs);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteWeight = async (id: string) => {
    try {
      await deleteWeightLog(id);
      setWeightLogs((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFavoriteFood = async (fav: Omit<FavoriteFood, 'id'>) => {
    if (!user) return;
    try {
      const favToAdd = { ...fav, userId: user.uid };
      const newId = await addFavoriteFood(favToAdd);
      setFavoriteFoods((prev) => [...prev, { ...favToAdd, id: newId }]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFavoriteFood = async (id: string) => {
    try {
      await deleteFavoriteFood(id);
      setFavoriteFoods((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogFavoriteToDate = async (fav: FavoriteFood, mealType: MealType) => {
    if (!user) return;
    try {
      const foodData: Omit<FoodLog, 'id'> = {
        userId: user.uid,
        date: selectedDate,
        mealType,
        foodName: fav.foodName,
        calories: fav.calories,
        proteinGrams: fav.proteinGrams,
        carbsGrams: fav.carbsGrams,
        fatGrams: fav.fatGrams,
        servingAmount: 1,
        servingUnit: fav.defaultServingUnit || '份',
      };
      const newId = await addFoodLog(foodData);
      setFoodLogs((prev) => [...prev, { ...foodData, id: newId }]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (newProfile: UserProfile) => {
    if (!user) return;
    try {
      await saveUserProfile({ ...newProfile, userId: user.uid });
      setProfile(newProfile);
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">NutriTrack 系統啟動中...</p>
      </div>
    );
  }

  return (
    <div id="nutritrack-app-root" className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Top Header Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        onGoogleSignIn={handleGoogleSignIn}
        onGuestSignIn={handleGuestSignIn}
        onSignOut={handleSignOut}
      />

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-600">✕</button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {dataLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">讀取健康資料與雲端日誌中...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                profile={profile}
                foodLogs={foodLogs}
                waterLog={waterLog}
                weightLogs={weightLogs}
                favoriteFoods={favoriteFoods}
                selectedDate={selectedDate}
                onOpenAddFoodModal={() => setIsAddFoodModalOpen(true)}
                onUpdateWaterCups={handleUpdateWaterCups}
                onQuickLogWeight={(w) => handleSaveWeight(selectedDate, w)}
                onQuickAddFavoriteFood={(fav) => handleLogFavoriteToDate(fav, 'lunch')}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'foodlog' && (
              <FoodLogSection
                foodLogs={foodLogs}
                selectedDate={selectedDate}
                favoriteFoods={favoriteFoods}
                onOpenAddModal={() => setIsAddFoodModalOpen(true)}
                onDeleteLog={handleDeleteFoodLog}
                onQuickAddFavoriteFood={(fav) => handleLogFavoriteToDate(fav, 'lunch')}
              />
            )}

            {activeTab === 'favorites' && (
              <FavoriteFoodManager
                favoriteFoods={favoriteFoods}
                onAddFavorite={handleAddFavoriteFood}
                onDeleteFavorite={handleDeleteFavoriteFood}
                onLogFavoriteToDate={handleLogFavoriteToDate}
              />
            )}

            {activeTab === 'weight' && (
              <WeightTracker
                weightLogs={weightLogs}
                profile={profile}
                selectedDate={selectedDate}
                onSaveWeight={handleSaveWeight}
                onDeleteWeight={handleDeleteWeight}
              />
            )}

            {activeTab === 'water' && (
              <WaterTracker
                waterLog={waterLog}
                profile={profile}
                selectedDate={selectedDate}
                onUpdateWaterCups={handleUpdateWaterCups}
                onUpdateWaterSettings={handleUpdateWaterSettings}
              />
            )}

            {activeTab === 'settings' && (
              <UserProfileSettings
                profile={profile}
                onSaveProfile={handleSaveProfile}
              />
            )}
          </>
        )}
      </main>

      {/* Add Food Dialog Modal */}
      <AddFoodModal
        isOpen={isAddFoodModalOpen}
        onClose={() => setIsAddFoodModalOpen(false)}
        selectedDate={selectedDate}
        favoriteFoods={favoriteFoods}
        onAddFood={handleAddFoodLog}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-800">NutriTrack 熱量與健康日誌</span>
            <span>© 2026</span>
          </div>
          <p>專業數據計算：Mifflin-St Jeor 經驗公式 | Google Firebase Firestore 雲端資料庫同步</p>
        </div>
      </footer>
    </div>
  );
}
