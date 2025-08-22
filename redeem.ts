import * as functions from 'firebase-functions';
import { db, assert, randomInt } from './utils.js';
import { credit } from './wallet.js';

export const applyRedeemCode = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  assert(uid, 'Not authenticated');
  const code = (data?.code || '').toString().trim();
  assert(code.length > 0, 'Invalid code');

  const ref = db.collection('redeemCodes').doc(code);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    assert(snap.exists, 'Code not found');
    const d = snap.data()!;
    const usesLeft = d.usesLeft ?? 0;
    const expiresAt = d.expiresAt?.toDate?.();
    assert(usesLeft > 0, 'Code exhausted');
    if (expiresAt) {
      const now = new Date();
      assert(now <= expiresAt, 'Code expired');
    }
    const min = d.amountMin ?? 1;
    const max = d.amountMax ?? 10;
    const amount = Math.floor(Math.random() * (max - min + 1)) + min;
    await credit(uid!, amount, 'redeem_code', { code });
    tx.update(ref, { usesLeft: usesLeft - 1 });
  });

  return { ok: true };
});
