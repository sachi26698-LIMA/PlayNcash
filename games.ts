import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { db, assert, randomInt } from './utils.js';
import { credit } from './wallet.js';
import { incrementDaily } from './limits.js';

const QUIZ_REWARD = 1;
const MEMORY_REWARD = 2;

export const playDice = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  assert(uid, 'Not authenticated');
  const maxPerDay = Number(process.env.DICE_DAILY_CAP || 100); // generous throttle
  await incrementDaily(uid!, 'dice', maxPerDay);

  // server RNG
  const roll = randomInt(1,6);
  let reward = 0;
  if (roll === 6) reward = 1;
  if (reward > 0) await credit(uid!, reward, 'dice', { roll });
  return { ok: true, roll, reward };
});

export const awardQuiz = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  assert(uid, 'Not authenticated');
  const correct = Number(data?.correct || 0);
  assert(correct >= 0 && correct <= 10, 'Invalid score');
  const maxPerDay = Number(process.env.QUIZ_DAILY_CAP || 10);
  await incrementDaily(uid!, 'quiz', maxPerDay);
  const reward = Math.min(correct, 10) * QUIZ_REWARD;
  if (reward > 0) await credit(uid!, reward, 'quiz', { correct });
  return { ok: true, reward };
});

export const awardMemory = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  assert(uid, 'Not authenticated');
  const won = !!data?.won;
  const maxPerDay = Number(process.env.MEMORY_DAILY_CAP || 10);
  await incrementDaily(uid!, 'memory', maxPerDay);
  const reward = won ? MEMORY_REWARD : 0;
  if (reward > 0) await credit(uid!, reward, 'memory', {});
  return { ok: true, reward };
});
