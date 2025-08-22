import * as admin from 'firebase-admin';
import { db, assert, ymd, ym } from './utils.js';

export interface Wallet { coins: number; lockedCoins: number; }

export async function ensureUserWallet(uid: string) {
  const walletRef = db.collection('wallets').doc(uid);
  const snap = await walletRef.get();
  if (!snap.exists) {
    await walletRef.set({ coins: 0, lockedCoins: 0 }, { merge: true });
  }
}

export async function credit(uid: string, amount: number, reason: string, meta: any = {}) {
  assert(amount > 0, 'Amount must be > 0');
  const walletRef = db.collection('wallets').doc(uid);
  const txRef = db.collection('transactions').doc();
  await db.runTransaction(async (tx) => {
    const wSnap = await tx.get(walletRef);
    const w = (wSnap.data() as Wallet) || { coins: 0, lockedCoins: 0 };
    const newCoins = (w.coins || 0) + amount;
    assert(newCoins >= 0, 'Negative balance');
    tx.set(walletRef, { coins: newCoins }, { merge: true });
    tx.set(txRef, {
      uid, type: 'credit', amount, reason, meta, createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Leaderboards
    const day = ymd(new Date());
    const month = ym(new Date());
    const dailyRef = db.collection('leaderboardDaily').doc(day).collection('users').doc(uid);
    const monthlyRef = db.collection('leaderboardMonthly').doc(month).collection('users').doc(uid);
    tx.set(dailyRef, { uid, score: admin.firestore.FieldValue.increment(amount) }, { merge: true });
    tx.set(monthlyRef, { uid, score: admin.firestore.FieldValue.increment(amount) }, { merge: true });
  });
  return true;
}

export async function debit(uid: string, amount: number, reason: string, meta: any = {}) {
  assert(amount > 0, 'Amount must be > 0');
  const walletRef = db.collection('wallets').doc(uid);
  const txRef = db.collection('transactions').doc();
  await db.runTransaction(async (tx) => {
    const wSnap = await tx.get(walletRef);
    const w = (wSnap.data() as Wallet) || { coins: 0, lockedCoins: 0 };
    const newCoins = (w.coins || 0) - amount;
    assert(newCoins >= 0, 'Insufficient balance');
    tx.set(walletRef, { coins: newCoins }, { merge: true });
    tx.set(txRef, {
      uid, type: 'debit', amount, reason, meta, createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
  return true;
}

export async function lockForWithdraw(uid: string, amount: number) {
  const walletRef = db.collection('wallets').doc(uid);
  await db.runTransaction(async (tx) => {
    const wSnap = await tx.get(walletRef);
    const w = (wSnap.data() as Wallet) || { coins: 0, lockedCoins: 0 };
    const coins = w.coins || 0;
    const locked = w.lockedCoins || 0;
    assert(coins >= amount, 'Insufficient coins');
    tx.set(walletRef, { coins: coins - amount, lockedCoins: locked + amount }, { merge: true });
  });
}
export async function unlockWithdraw(uid: string, amount: number) {
  const walletRef = db.collection('wallets').doc(uid);
  await db.runTransaction(async (tx) => {
    const wSnap = await tx.get(walletRef);
    const w = (wSnap.data() as Wallet) || { coins: 0, lockedCoins: 0 };
    const coins = w.coins || 0;
    const locked = w.lockedCoins || 0;
    assert(locked >= amount, 'Locked insufficient');
    tx.set(walletRef, { coins: coins + amount, lockedCoins: locked - amount }, { merge: true });
  });
}
export async function settlePaid(uid: string, amount: number) {
  const walletRef = db.collection('wallets').doc(uid);
  await db.runTransaction(async (tx) => {
    const wSnap = await tx.get(walletRef);
    const w = (wSnap.data() as Wallet) || { coins: 0, lockedCoins: 0 };
    const locked = w.lockedCoins || 0;
    assert(locked >= amount, 'Locked insufficient');
    tx.set(walletRef, { lockedCoins: locked - amount }, { merge: true });
  });
}
