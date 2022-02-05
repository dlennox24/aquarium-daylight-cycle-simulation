import 'core-js/stable';
import 'regenerator-runtime/runtime';
import pkg from '../package.json';
import buildConfig from './commands/build-config/build-config';
import move from './commands/move/move';
import log from './utils/log';

const { resolve } = require('path');

const { Command, InvalidArgumentError } = require('commander');
const program = new Command();

let command = '';
let argv = {};

const configPathOptions = [
  '--config-path <pathToFile>',
  'Path to the config file',
  resolve('./config.json'),
];

const validPositions = [
  'sunrise',
  'noon',
  'sunset',
  'moonrise',
  'moon',
  'moonset',
];
function isValidPositionType(value) {
  if (!validPositions.includes(value)) {
    log.error(`Invalid position: ${value}`);
    throw new InvalidArgumentError(
      `Position must be one of [${validPositions}].`
    );
  }
  return value;
}

program.name(pkg.name).description(pkg.description).version(pkg.version);

program
  .command('move')
  .description(
    'Initiate move of the light(s) from one position to another. ' +
      `Position must be one of [${validPositions}].`
  )
  .argument('<from>', 'Starting position of the light(s)', isValidPositionType)
  .argument('<to>', 'Ending position of hte light(s)', isValidPositionType)
  .option(...configPathOptions)
  .option(
    '--no-exec-python',
    `Don't execute python scripts. Used for testing Node.js scripts`
  )
  .action((from, to, options, program) => {
    command = program.name();
    argv = {
      from,
      to,
      ...options,
    };
  });

program
  .command('build-config')
  .description('Builds the initial config file based of a JSON input file.')
  .option(...configPathOptions)
  .option(
    '-i, --inputs-path <string>',
    'Path to the inputs file',
    resolve('./inputs.json')
  )
  .action((options, program) => {
    command = program.name();
    argv = options;
  });

program.parse();

switch (command) {
  case 'build-config':
    log.text('config');
    buildConfig(argv);
    break;
  case 'move':
    log.text('move');
    move(argv);
    break;

  default:
    log.error(`Unknown command: ${command}`);
    break;
}
