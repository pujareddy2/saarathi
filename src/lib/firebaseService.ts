import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types';

export const saveUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    ...data,
    userId,
    updatedAt: Date.now()
  }, { merge: true });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }
  return null;
};

export const logDecision = async (userId: string, log: any) => {
  const logsRef = collection(db, 'logs');
  await addDoc(logsRef, {
    ...log,
    userId,
    timestamp: Date.now()
  });
};

export const getDecisionLogs = async (userId: string) => {
  const logsRef = collection(db, 'logs');
  const q = query(
    logsRef, 
    where('userId', '==', userId), 
    orderBy('timestamp', 'desc'), 
    limit(20)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data());
};
