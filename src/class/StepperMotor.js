import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import log from '../utils/log';
import { roundFloat, roundInt } from '../utils/utils';

class StepperMotor {
  constructor(motor) {
    this.id = motor.id;
    this.coords = motor.coords;
    this.gpioPins = motor.gpioPins;
    this.stepsPerMm = motor.stepsPerMm;

    this.stepCount = 0;
    this.pythonProcess = null;
  }

  move(from, to, time_ms) {
    log.text(`move: ${from} → ${to}`, { tag: this.id });
    const dist_mm = this.coords[to] - this.coords[from];
    const steps = roundInt(this.stepsPerMm * dist_mm);
    const delay = roundFloat(time_ms / steps);
    log.text(
      `coords: ${this.coords[from]} → ${this.coords[to]} (${dist_mm}mm)`,
      {
        tag: this.id,
      }
    );
    log.text(`steps: ${steps} (${dist_mm} mm * ${this.stepsPerMm} s/mm)`, {
      tag: this.id,
    });
    log.text(`delay: ${delay}`, { tag: this.id });
  }

  doFullSteps(args) {
    let { isReversed, delay, steps } = args;
    delay = delay >= 2 ? delay : 2;
    steps = steps >= 1 ? steps : 1;

    let stepOrder = ['1100', '0110', '0011', '1001'];
    if (isReversed) {
      stepOrder.reverse();
    }

    this.pythonProcess = spawn('python3', [
      '-u',
      path.join(__dirname, 'step.py'),
      '-d',
      delay,
      '-p',
      this.gpioPins.toString(),
      '-s',
      steps,
      '-o',
      stepOrder.toString(),
    ]);

    this.pythonProcess.stdout.on('data', (data) => {
      log.text(data, { tag: this.id });
    });
    this.pythonProcess.stderr.on('data', (data) => {
      log.error(data, { tag: this.id });
    });
    this.pythonProcess.stderr.on('close', () => {
      log.text('closed', { tag: this.id });
    });

    return this.pythonProcess;
  }

  resetStepCount() {
    this.stepCount = 0;
  }

  destroy() {
    console.log('...done');
  }
}

export const testStepperMotor = () => {
  try {
    const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

    const m1 = new StepperMotor(config.motors[0]);
    m1.doFullSteps({ steps: 1024, delay: 500 });
    m1.destroy();

    process.on('SIGINT', () => {
      m1.destroy();
    });
  } catch (err) {
    console.error(err);
  }
};

export default StepperMotor;
