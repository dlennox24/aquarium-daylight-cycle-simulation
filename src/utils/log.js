import chalk from 'chalk';
import util from 'util';

const title = (t, { indent = 0, tag = '' } = {}) =>
  console.log(`\n${' '.repeat(indent)}${chalk.bgCyan.black(` ${t} `)}`);
const subtitle = (t, { indent = 1, tag = '' } = {}) =>
  console.log(`${' '.repeat(indent)}${chalk.bgMagenta.black(` ${t} `)}`);
const success = (t, { indent = 1, tag = '' } = {}) => {
  console.log(
    `${' '.repeat(indent)}${chalk.black.bgGreen(
      ` ${tag + (tag && ' ')}`
    )} ${chalk.green(t)}`
  );
};
const warn = (t, { indent = 1, tag = '' } = {}) => {
  console.warn(
    `${' '.repeat(indent)}${chalk.black.bgYellow(
      ` ${tag + (tag && ' ')}`
    )} ${chalk.yellow(t)}`
  );
};
const error = (t, { indent = 1, tag = '' } = {}) => {
  console.error(
    `${' '.repeat(indent)}${chalk.black.bgRed(
      ` ${tag + (tag && ' ')}`
    )} ${chalk.red(t)}`
  );
};
const text = (t, { indent = 1, tag = '' } = {}) => {
  console.log(
    `${' '.repeat(indent)}${chalk.black.bgWhite(
      ` ${tag + (tag && ' ')}`
    )} ${chalk.white(t)}`
  );
};
const object = (o) => console.log(util.inspect(o, false, null, true));

export default {
  error,
  object,
  subtitle,
  success,
  text,
  title,
  warn,
};
