import fs from 'fs';
import { DateTime } from 'luxon';
import { resolve } from 'path';
import log from './log';

export const roundInt = (num, length = 0, radix = 10) =>
  parseInt(Number(num).toFixed(length), radix);

export const roundFloat = (num, length = 1, radix = 10) =>
  parseFloat(Number(num).toFixed(length), radix);

export const timeDiff_ms = (start, end) =>
  Math.abs(
    DateTime.fromFormat(end, 'HH:mm')
      .diff(DateTime.fromFormat(start, 'HH:mm'))
      .toObject().milliseconds
  );

// Pauses JS execution thread: https://www.sitepoint.com/delay-sleep-pause-wait/
export const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export const readConfigFile = (configPath) => {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    log.success(`config found! ${resolve(configPath)}`);
    log.text(`config build: ${new Date(config.buildDate).toGMTString()}`);
    return config;
  } catch (err) {
    log.error(err);
    return null;
  }
};
