import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db, assert } from './utils.js';
import { credit } from './wallet.js';

// Set referrer for a user (only once). data: { code: 'ABC123' }
export const applyReferrer = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  assert(uid, 'Not authenticated');
  const code = (data?.code || '').toString().trim().toUpperCase();
  assert(code, 'Missing code');

  // find user with referralCode == code
  const qs = await db.collection('users').where('referralCode','==',code).limit(1).get();
  assert(!qs.empty, 'Code invalid');
  const referrerUid = qs.docs[0].id;
  assert(referrerUid !== uid, 'Self-referral not allowed');

  const meRef = db.collection('users').doc(uid);
  const me = await meRef.get();
  assert(!me.get('referrer'), 'Referrer already set');

  await meRef.set({ referrer: referrerUid }, { merge: true });
  return { ok: true, referrerUid };
});

// Trigger on any credit: if a user crosses 50 coins total for first time, reward referrer and referee
export const onWalletCredit = functions.firestore.document('transactions/{txId}').onCreate(async (snap, ctx) => {
  const d = snap.data();
  if (d.type !== 'credit') return;
  const uid: string = d.uid;
  const userRef = db.collection('users').doc(uid);
  const user = await userRef.get();
  const referrer = user.get('referrer');
  if (!referrer) return;

  const w = await db.collection('wallets').doc(uid).get();
  const coins = (w.data()?.coins || 0) as number;
  if (coins < 50) return; // milestone not hit

  // Has milestone already rewarded?
  const refDoc = db.collection('referrals').doc(uid);
  const refSnap = await refDoc.get();
  if (refSnap.exists && refSnap.get('milestoneRewarded')) return;

  // reward both
  await credit(uid, 10, 'referral_milestone', { referrer });
  await credit(referrer, 20, 'referral_milestone_referrer', { referee: uid });
  await refDoc.set({ milestoneRewarded: true, at: admin.firestore.FieldValue.serverTimestamp(), referrer }, { merge: true });
});
