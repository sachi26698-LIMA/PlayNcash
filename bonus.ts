import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db, assert, randomInt } from './utils.js';
import { credit } from './wallet.js';

export const claimDailyBonus = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  assert(uid, 'Not authenticated');

  const min = Number(process.env.BONUS_MIN || 3);
  const max = Number(process.env.BONUS_MAX || 5);

  const userRef = db.collection('users').doc(uid);
  const snap = await userRef.get();
  const last = snap.get('lastBonusAt')?.toDate?.() as Date | undefined;
  const now = new Date();

  if (last) {
    const next = new Date(last.getTime() + 24 * 60 * 60 * 1000);
    assert(now >= next, 'Cooldown active. Try later.');
  }

  const amount = randomInt(min, max);
  await credit(uid, amount, 'daily_bonus', {});
  await userRef.set({ lastBonusAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });

  return { ok: true, amount };
});
