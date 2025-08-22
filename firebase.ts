import Constants from 'expo-constants';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const cfg: any = Constants?.expoConfig?.extra?.firebase || Constants?.manifest?.extra?.firebase;
if (!getApps().length) initializeApp(cfg);

export const auth = getAuth();
export const db = getFirestore();
export const functions = getFunctions();
