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
    this.pythonProcess = null;
  }

  move(from, to, time_ms) {
    log.text(`move: ${from} → ${to}`, { tag: this.id });
    const pyConfig = {
      ...this,
      time_ms,
      dist_mm: this.coords[to] - this.coords[from],
    };
    pyConfig.steps = roundInt(this.stepsPerMm * pyConfig.dist_mm);
    pyConfig.delay = roundFloat(time_ms / pyConfig.steps);
    pyConfig.pins = Object.keys(this.gpioPins).map(
      (pinKey) => this.gpioPins[pinKey]
    );
    delete pyConfig.pythonProcess;

    log.text(
      `coords: ${this.coords[from]} → ${this.coords[to]} (${pyConfig.dist_mm}mm)`,
      {
        tag: this.id,
      }
    );
    log.text(
      `steps: ${pyConfig.steps} (${pyConfig.dist_mm} mm * ${this.stepsPerMm} s/mm)`,
      {
        tag: this.id,
      }
    );
    log.text(`delay: ${pyConfig.delay} ms`, { tag: this.id });
    log.text(`pins: ${JSON.stringify(this.gpioPins)}`, { tag: this.id });
    log.text(JSON.stringify(pyConfig), { tag: this.id });

    this.pythonProcess = spawn('python3', [
      '-u',
      path.join(__dirname, 'step.py'),
      '--configString',
      JSON.stringify(pyConfig),
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
  }

  destroy() {
    if (this.pythonProcess) {
      this.pythonProcess.kill('SIGINT');
    }
    console.log('...done');
  }
}

export default StepperMotor;
