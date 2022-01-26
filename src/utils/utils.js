import { DateTime } from 'luxon';

export const roundInt = (num, length = 0, radix = 10) =>
  parseInt(Number(num).toFixed(length), radix);

export const roundFloat = (num, length = 1, radix = 10) =>
  parseFloat(Number(num).toFixed(length), radix);

export const timeDiff_ms = (start, end) =>
  DateTime.fromFormat(end, 'HH:mm')
    .diff(DateTime.fromFormat(start, 'HH:mm'))
    .toObject().milliseconds;

// Pauses JS execution thread: https://www.sitepoint.com/delay-sleep-pause-wait/
export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
