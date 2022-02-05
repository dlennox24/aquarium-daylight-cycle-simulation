import 'core-js/stable';
import fs from 'fs';
import 'regenerator-runtime/runtime';
import StepperMotor from './class/StepperMotor';
import buildConfig from './utils/buildConfig';
import log from './utils/log';
const { resolve } = require('path');
var argv = require('minimist')(process.argv.slice(2));
const {
  configPath = './config.json',
  configInputsPath = './inputs.json',
  from,
  to,
  rebuild = false,
  noPy = false, // doesn't fire python motor scripts
} = argv;

const start = () => {
  log.title('Starting Python Execution');

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    log.success(`config found! ${resolve(configPath)}`);
    log.text(`config build: ${new Date(config.buildDate).toGMTString()}`);

    const steppers = Object.keys(config.motors).map((motorId, i) => {
      const motor = config.motors[motorId];

      try {
        let time_ms = 5 * 60 * 1000;
        if (from === 'sunrise' && to === 'noon') {
          time_ms = config.times.sunrise.total_ms;
        }
        if (from === 'noon' && to === 'sunset') {
          time_ms = config.times.sunset.total_ms;
        }

        log.text(`creating ${motorId}`, { tag: motorId });
        const stepperMotor = new StepperMotor(motor);
        log.success(`created motor!`, { tag: motorId });

        if (!noPy) {
          stepperMotor.move(from, to, time_ms);
        }

        return stepperMotor;
      } catch (error) {
        log.error(`Failed to start ${motorId}:\n     ${error}`);
      }
    });

    process.on('SIGINT', () => {
      steppers.forEach((stepperMotor) => {
        stepperMotor.destroy();
      });
    });
  } catch (err) {
    log.error(err);
  }
};

log.title('Starting Sunrise/set Sim');
log.text(`route: ${from} → ${to}`);

if (rebuild || !fs.existsSync(configPath)) {
  if (!fs.existsSync(configPath)) {
    log.warn(`no config file found: ${resolve(configPath)}`);
  }
  buildConfig({ configPath, configInputsPath });
}

if (to && from) {
  start();
} else {
  if (!to) {
    log.error(
      `invalid \`to\` arg: \'${to}\'. must be one of [sunrise, noon, sunset, moon]`
    );
  }
  if (!from) {
    log.error(
      `invalid \`from\` arg: \'${from}\'. must be one of [sunrise, noon, sunset, moon]`
    );
  }
}
