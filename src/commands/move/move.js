import 'core-js/stable';
import fs from 'fs';
import { resolve } from 'path';
import 'regenerator-runtime/runtime';
import StepperMotor from '../../class/StepperMotor';
import log from '../../utils/log';

const move = ({ from, to, configPath, execPython }) => {
  log.title('Starting Positional Move');
  log.text(`route: ${from} → ${to}`);

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    log.success(`config found! ${resolve(configPath)}`);
    log.text(`config build: ${new Date(config.buildDate).toGMTString()}`);

    const steppers = Object.keys(config.motors).map((motorId, i) => {
      const motor = config.motors[motorId];

      try {
        let time_ms = config.gearDriver.minDelay;
        if (from === 'sunrise' && to === 'noon') {
          time_ms = config.times.sunrise.total_ms;
        }
        if (from === 'noon' && to === 'sunset') {
          time_ms = config.times.sunset.total_ms;
        }

        log.text(`creating ${motorId}`, { tag: motorId });
        const stepperMotor = new StepperMotor(motor, execPython);
        log.success(`created motor!`, { tag: motorId });

        stepperMotor.move(from, to, time_ms);

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

export default move;
