import { spawn } from 'child_process';
import path from 'path';
import log from '../utils/log';
import { roundInt } from '../utils/utils';

class StepperMotor {
  constructor(motor, execPython = false) {
    this.id = motor.id;
    this.coords = motor.coords;
    this.gpioPins = motor.gpioPins;
    this.stepsPerMm = motor.stepsPerMm;
    this.microsteps = motor.microsteps;
    this.minDelay = motor.minDelay;
    this.pythonProcess = null;

    this.execPython = execPython;
  }

  move(from, to, stepperDelay_ms) {
    log.text(`move: ${from} → ${to}`, { tag: this.id });
    const pyConfig = {
      ...this,
      stepperDelay_ms,
      dist_mm: this.coords[to] - this.coords[from],
    };
    pyConfig.steps = roundInt(this.stepsPerMm * pyConfig.dist_mm);
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

    if (this.execPython) {
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
  }

  destroy() {
    if (this.pythonProcess && !this.execPython) {
      this.pythonProcess.kill('SIGINT');
    }
    console.log('...done');
  }
}

export default StepperMotor;
