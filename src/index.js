import 'core-js/stable';
import 'regenerator-runtime/runtime';
import pkg from '../package.json';
import StepperMotor from './class/StepperMotor';
import buildConfig from './commands/build-config/build-config';
import log from './utils/log';
import { readConfigFile } from './utils/utils';
const { Command, InvalidArgumentError } = require('commander');
const { resolve } = require('path');

let command = '';
let argv = {};

const optionTypes = {
  noExecPython: [
    '--no-exec-python',
    `Don't execute python scripts. Used for testing Node.js scripts`,
  ],
  configPath: [
    '--config-path <pathToFile>',
    'Path to the config file',
    resolve('./config.json'),
  ],
};

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

const program = new Command();
program.name(pkg.name).description(pkg.description).version(pkg.version);

program
  .command('phase')
  .description(
    `Begin a movement phase. Phase must be one of [${validPositions}].`
  )
  .argument('<phase>', 'Phase to move through', isValidPositionType)
  .option(...optionTypes.configPath)
  .option(...optionTypes.noExecPython)
  .action((phase, options, program) => {
    command = program.name();
    argv = {
      phase,
      ...options,
    };
  });

program
  .command('move')
  .description(
    'Initiate move of the light(s) from one position to another. ' +
      `Positions must be one of [${validPositions}].`
  )
  .argument('<from>', 'Starting position of the light(s)', isValidPositionType)
  .argument('<to>', 'Ending position of hte light(s)', isValidPositionType)
  .option(...optionTypes.configPath)
  .option(...optionTypes.noExecPython)
  .action((from, to, options, program) => {
    command = program.name();
    argv = {
      from,
      to,
      ...options,
    };
  });

program
  .command('calibrate')
  .description(
    'Initial calibration of light positioning and stepper motor steps per millimeter.'
  )
  .argument(
    '<closestSwitch>',
    'Which direction is the nearest calibration switch? (east/west)'
  )
  .option(...optionTypes.configPath)
  .option(...optionTypes.noExecPython)
  .action((dir, options, program) => {
    command = program.name();
    argv = { dir, ...options };
  });

program
  .command('build-config')
  .description('Builds the initial config file based of a JSON input file.')
  .option(...optionTypes.configPath)
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

let steppers = [];
let config = {};

switch (command) {
  case 'move':
  case 'phase':
  case 'calibrate':
    const { configPath, execPython } = argv;

    log.title(`Reading Config File`);
    log.text(`config path: ${configPath}`);
    config = readConfigFile(configPath);
    try {
      log.title('Creating Stepper Motors');
      steppers = Object.keys(config.motors).map((motorId, i) => {
        const motor = config.motors[motorId];

        log.text(`creating ${motorId}`, { tag: motorId });
        const stepperMotor = new StepperMotor(
          motor,
          execPython,
          configPath,
          config
        );
        log.success(`created motor!`, { tag: motorId });

        return stepperMotor;
      });

      process.on('SIGINT', () => {
        steppers.forEach((stepperMotor) => {
          stepperMotor.destroy();
        });
      });
    } catch (err) {
      log.error(err);
    }
    break;

  default:
    break;
}

switch (command) {
  case 'build-config':
    buildConfig(argv);
    break;
  case 'move':
    log.title('Starting Positional Move');
    steppers.forEach((stepperMotor) => {
      try {
        stepperMotor.move(argv.from, argv.to);
      } catch (error) {
        log.error(`Failed to move ${stepperMotor.id}:\n     ${error}`);
      }
    });
    break;
  case 'phase':
    log.title('Starting Phase Move');
    const phase = config.phases[argv.phase];
    steppers.forEach((stepperMotor) => {
      try {
        stepperMotor.move(phase.beginPos, phase.endPos, phase.total_ms);
      } catch (error) {
        log.error(`Failed to move ${stepperMotor.id}:\n     ${error}`);
      }
    });
    break;
  case 'calibrate':
    log.title('Calibration');
    steppers.forEach((stepperMotor) => {
      try {
        stepperMotor.calibrate(
          argv.dir,
          config.gearDriver.calibrationLength_mm,
          config.gearDriver.calibrationSwitch0Pos
        );
      } catch (error) {
        log.error(
          `Failed to begin calibration ${stepperMotor.id}:\n     ${error}`
        );
      }
    });
    break;

  default:
    log.error(`Unknown command: ${command}`);
    break;
}
