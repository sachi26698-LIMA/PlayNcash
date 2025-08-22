import * as admin from 'firebase-admin';

export const db = admin.firestore();

export function assert(condition: any, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const now = () => admin.firestore.Timestamp.now();

export function ymd(d: Date = new Date()) {
  return d.toISOString().slice(0,10);
}
export function ym(d: Date = new Date()) {
  return d.toISOString().slice(0,7);
}
