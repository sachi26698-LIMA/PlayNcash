export const RC_DEFAULTS = {
  bonus_min: 3,
  bonus_max: 5,
  quiz_daily_cap: 10,
  memory_daily_cap: 10,
  ad_frequency: 3,
  min_withdraw: 20
} as const;

export type WithdrawStatus = 'pending' | 'paid' | 'rejected';
