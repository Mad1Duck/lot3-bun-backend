import crypto from 'crypto';

export const hashNumberArray = (arr: number[]): number => {
  const str = arr.join(',');
  const hash = crypto.createHash('sha256').update(str).digest('hex');
  return parseInt(hash.slice(0, 8), 16);
};