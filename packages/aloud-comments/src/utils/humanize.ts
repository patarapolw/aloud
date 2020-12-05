import { durationToString } from 'native-duration';

export function humanizeDurationToNow(epoch: number) {
  const now = new Date();
  const msec = +now - epoch;

  if (msec < 5000) {
    return 'Just posted';
  }

  return durationToString(new Date(epoch), now, { trim: 2 }) + ' ago';
}
