import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db, assert } from './utils.js';
import { lockForWithdraw, unlockWithdraw, settlePaid } from './wallet.js';

export const requestWithdraw = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  assert(uid, 'Not authenticated');
  const amount = Number(data?.amount || 0);
  const upi = (data?.upi || '').toString().trim();
  const name = (data?.name || '').toString().trim();

  const min = Number(process.env.MIN_WITHDRAW || 20);
  assert(amount >= min, `Minimum withdraw is ${min}`);
  assert(upi.length >= 6, 'Invalid UPI');

  await lockForWithdraw(uid!, amount);

  const ref = db.collection('withdrawRequests').doc();
  await ref.set({
    uid, amount, upi, name,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return { ok: true, id: ref.id };
});

async function notify(uid: string, title: string, body: string) {
  const token = (await db.collection('users').doc(uid).get()).get('fcmToken');
  if (!token) return;
  await admin.messaging().send({ token, notification: { title, body } });
}

export const markWithdrawPaid = functions.https.onCall(async (data, context) => {
  const isAdmin = context.auth?.token?.admin === true;
  assert(isAdmin, 'Admin only');

  const id = (data?.id || '').toString();
  const ref = db.collection('withdrawRequests').doc(id);
  const snap = await ref.get();
  assert(snap.exists, 'Request not found');
  const d = snap.data()!;
  assert(d.status === 'pending', 'Not pending');

  await settlePaid(d.uid, d.amount);
  await ref.update({ status: 'paid', paidAt: admin.firestore.FieldValue.serverTimestamp() });

  const msgRef = db.collection('inbox').doc(d.uid).collection('msgs').doc();
  await msgRef.set({
    title: 'Payout Success',
    body: `Your withdraw of ₹${d.amount} has been paid.`,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    read: false
  });
  await notify(d.uid, 'Payout Success', `₹${d.amount} paid to your UPI.`);
  return { ok: true };
});

export const markWithdrawRejected = functions.https.onCall(async (data, context) => {
  const isAdmin = context.auth?.token?.admin === true;
  assert(isAdmin, 'Admin only');

  const id = (data?.id || '').toString();
  const reason = (data?.reason || '').toString();
  assert(id, 'Missing id');

  const ref = db.collection('withdrawRequests').doc(id);
  const snap = await ref.get();
  assert(snap.exists, 'Request not found');
  const d = snap.data()!;
  assert(d.status === 'pending', 'Not pending');

  await unlockWithdraw(d.uid, d.amount);
  await ref.update({ status: 'rejected', reason });

  const msgRef = db.collection('inbox').doc(d.uid).collection('msgs').doc();
  await msgRef.set({
    title: 'Payout Rejected',
    body: `Your withdraw of ₹${d.amount} was rejected. Reason: ${reason}`,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    read: false
  });
  await notify(d.uid, 'Payout Rejected', `₹${d.amount} rejected: ${reason}`);
  return { ok: true };
});
