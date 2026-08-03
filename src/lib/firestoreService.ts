import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, FoodLog, WeightLog, WaterLog, FavoriteFood } from '../types';
import { DEFAULT_USER_PROFILE, SAMPLE_FAVORITE_FOODS } from './calculator';

// --- USER PROFILE ---
export async function getUserProfile(userId: string): Promise<UserProfile> {
  if (!userId) return DEFAULT_USER_PROFILE;
  try {
    const docRef = doc(db, 'userProfiles', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...snap.data(), userId } as UserProfile;
    } else {
      // Initialize with default profile
      const newProfile: UserProfile = { ...DEFAULT_USER_PROFILE, userId };
      await setDoc(docRef, newProfile);
      return newProfile;
    }
  } catch (err) {
    console.error('Error fetching user profile from Firestore:', err);
    return { ...DEFAULT_USER_PROFILE, userId };
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (!profile.userId) return;
  try {
    const docRef = doc(db, 'userProfiles', profile.userId);
    await setDoc(docRef, { ...profile, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error('Error saving user profile to Firestore:', err);
    throw err;
  }
}

// --- FOOD LOGS ---
export async function getFoodLogsForDate(userId: string, date: string): Promise<FoodLog[]> {
  if (!userId || !date) return [];
  try {
    const q = query(
      collection(db, 'foodLogs'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    const querySnap = await getDocs(q);
    const logs: FoodLog[] = [];
    querySnap.forEach((docSnap) => {
      logs.push({ id: docSnap.id, ...docSnap.data() } as FoodLog);
    });
    return logs;
  } catch (err) {
    console.error('Error fetching food logs:', err);
    return [];
  }
}

export async function addFoodLog(log: Omit<FoodLog, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'foodLogs'), {
      ...log,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    console.error('Error adding food log:', err);
    throw err;
  }
}

export async function deleteFoodLog(logId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'foodLogs', logId));
  } catch (err) {
    console.error('Error deleting food log:', err);
    throw err;
  }
}

// --- WEIGHT LOGS ---
export async function getWeightLogs(userId: string): Promise<WeightLog[]> {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'weightLogs'),
      where('userId', '==', userId)
    );
    const querySnap = await getDocs(q);
    const logs: WeightLog[] = [];
    querySnap.forEach((docSnap) => {
      logs.push({ id: docSnap.id, ...docSnap.data() } as WeightLog);
    });
    // Sort in memory by date ascending
    return logs.sort((a, b) => a.date.localeCompare(b.date));
  } catch (err) {
    console.error('Error fetching weight logs:', err);
    return [];
  }
}

export async function saveWeightLog(userId: string, date: string, weightKg: number, note = ''): Promise<void> {
  if (!userId || !date || !weightKg) return;
  try {
    // Check if record for this date exists
    const q = query(
      collection(db, 'weightLogs'),
      where('userId', '==', userId),
      where('date', '==', date)
    );
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const existingDoc = querySnap.docs[0];
      await updateDoc(doc(db, 'weightLogs', existingDoc.id), {
        weightKg,
        note,
        createdAt: new Date().toISOString()
      });
    } else {
      await addDoc(collection(db, 'weightLogs'), {
        userId,
        date,
        weightKg,
        note,
        createdAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('Error saving weight log:', err);
    throw err;
  }
}

export async function deleteWeightLog(logId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'weightLogs', logId));
  } catch (err) {
    console.error('Error deleting weight log:', err);
    throw err;
  }
}

// --- WATER LOGS ---
export async function getWaterLogForDate(userId: string, date: string, defaultCupVolume = 250): Promise<WaterLog> {
  if (!userId || !date) {
    return { userId, date, cups: 0, cupVolumeMl: defaultCupVolume, totalMl: 0 };
  }
  try {
    const docId = `${userId}_${date}`;
    const docRef = doc(db, 'waterLogs', docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as WaterLog;
    } else {
      return {
        id: docId,
        userId,
        date,
        cups: 0,
        cupVolumeMl: defaultCupVolume,
        totalMl: 0
      };
    }
  } catch (err) {
    console.error('Error fetching water log:', err);
    return { userId, date, cups: 0, cupVolumeMl: defaultCupVolume, totalMl: 0 };
  }
}

export async function updateWaterLog(userId: string, date: string, cups: number, cupVolumeMl: number): Promise<void> {
  if (!userId || !date) return;
  try {
    const docId = `${userId}_${date}`;
    const docRef = doc(db, 'waterLogs', docId);
    const safeCups = Math.max(0, cups);
    await setDoc(docRef, {
      userId,
      date,
      cups: safeCups,
      cupVolumeMl,
      totalMl: safeCups * cupVolumeMl,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.error('Error updating water log:', err);
    throw err;
  }
}

// --- FAVORITE FOODS ---
export async function getFavoriteFoods(userId: string): Promise<FavoriteFood[]> {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, 'favoriteFoods'),
      where('userId', '==', userId)
    );
    const querySnap = await getDocs(q);
    const favs: FavoriteFood[] = [];
    querySnap.forEach((docSnap) => {
      favs.push({ id: docSnap.id, ...docSnap.data() } as FavoriteFood);
    });

    // If empty, initialize default sample favorite foods
    if (favs.length === 0) {
      for (const sample of SAMPLE_FAVORITE_FOODS) {
        const docRef = await addDoc(collection(db, 'favoriteFoods'), {
          userId,
          ...sample,
          createdAt: new Date().toISOString()
        });
        favs.push({ id: docRef.id, userId, ...sample });
      }
    }
    return favs;
  } catch (err) {
    console.error('Error fetching favorite foods:', err);
    return SAMPLE_FAVORITE_FOODS.map((s, idx) => ({ id: `sample_${idx}`, userId, ...s }));
  }
}

export async function addFavoriteFood(fav: Omit<FavoriteFood, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'favoriteFoods'), {
      ...fav,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (err) {
    console.error('Error adding favorite food:', err);
    throw err;
  }
}

export async function deleteFavoriteFood(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'favoriteFoods', id));
  } catch (err) {
    console.error('Error deleting favorite food:', err);
    throw err;
  }
}
