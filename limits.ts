import * as admin from 'firebase-admin';
import { db, assert, ymd } from './utils.js';

export async function incrementDaily(uid: string, key: 'quiz'|'memory'|'dice', maxPerDay: number) {
  const day = ymd(new Date());
  const ref = db.collection('limits').doc(uid).collection('daily').doc(day);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const d = snap.data() || {};
    const count = (d[key] || 0) + 1;
    assert(count <= maxPerDay, `Daily cap reached for ${key}`);
    tx.set(ref, { [key]: count }, { merge: true });
  });
}
