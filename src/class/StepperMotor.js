import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import log from '../utils/log';
import { roundFloat, roundInt } from '../utils/utils';

class StepperMotor {
  constructor(motor, execPython = false, configPath, config) {
    this.id = motor.id;
    this.coords = motor.coords;
    this.gpioPins = motor.gpioPins;
    this.stepsPerMm = motor.stepsPerMm;
    this.microsteps = motor.microsteps;
    this.minDelay = motor.minDelay;
    this.pythonProcess = null;

    this.configPath = configPath;
    this.config = config;
    this.execPython = execPython;
  }

  calibrate(calibrationDir, calibrationLength_mm, calibrationSwitch0Pos) {
    log.text(`Beginning calibration`, { tag: this.id });
    const pyConfig = this.exec('calibrate', {
      calibrationLength_mm,
      calibrationDir,
      calibrationSwitch0Pos,
    });
    log.object(pyConfig);
  }

  move(from, to, total_ms = 0) {
    log.text(`move: ${from} → ${to}`, { tag: this.id });
    const pyConfig = this.exec('move', { from, to, total_ms });

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
  }

  exec(
    type,
    {
      from,
      to,
      total_ms = 0,
      calibrationLength_mm,
      calibrationDir,
      calibrationSwitch0Pos,
    } = {}
  ) {
    const pyConfig = {
      ...this,
      total_ms,
      calibrationLength_mm,
      calibrationDir,
      calibrationSwitch0Pos,
      dist_mm: type === 'move' ? this.coords[to] - this.coords[from] : null,
    };
    delete pyConfig.pythonProcess; // python script doesn't need
    pyConfig.steps = roundInt(this.stepsPerMm * pyConfig.dist_mm);

    pyConfig.outPins = Object.keys(this.gpioPins)
      .filter((pinKey) => {
        if (!pinKey.includes('calibration')) return pinKey;
      })
      .map((pinKey) => this.gpioPins[pinKey]);
    pyConfig.inPins = Object.keys(this.gpioPins)
      .filter((pinKey) => {
        if (pinKey.includes('calibration')) return pinKey;
      })
      .map((pinKey) => this.gpioPins[pinKey]);

    pyConfig.stepperDelay_ms =
      type === 'move' ? total_ms / pyConfig.steps : this.minDelay;

    if (pyConfig.stepperDelay_ms < this.minDelay) {
      log.warn(
        `Calculated stepper motor delay (${pyConfig.stepperDelay_ms}ms) is less than minimum delay (${this.minDelay}ms). Setting delay to miniums.`,
        { tag: this.id }
      );
      pyConfig.stepperDelay_ms = this.minDelay;
    }

    log.text(`delay: ${pyConfig.stepperDelay_ms} ms`, { tag: this.id });
    log.text(`pins: ${JSON.stringify(this.gpioPins)}`, { tag: this.id });
    log.text(JSON.stringify(pyConfig), { tag: this.id });

    if (this.execPython) {
      this.pythonProcess = spawn('python3', [
        '-u',
        path.join(__dirname, 'step.py'),
        '--configString',
        JSON.stringify(pyConfig),
        '--type',
        type,
      ]);

      this.pythonProcess.stdout.on('data', (data) => {
        if (data.includes('output_')) {
          log.object(data.toString());
          const [key, value] = data
            .toString()
            .replace('\n', '')
            .split('output_')[1]
            .split(':');

          if (key === 'stepsPerMm') {
            this.updateConfig({
              ...this.config,
              motors: {
                ...this.config.motors,
                [this.id]: {
                  ...this.config.motors[this.id],
                  stepsPerMm: roundFloat(value),
                },
              },
            });
          }
        }
        log.text(data, { tag: this.id });
      });
      this.pythonProcess.stderr.on('data', (data) => {
        log.error(data, { tag: this.id });
      });
      this.pythonProcess.stderr.on('close', () => {
        log.text('closed', { tag: this.id });
      });
    }

    return pyConfig;
  }

  updateConfig(newConfig) {
    try {
      if (!fs.existsSync(this.configPath)) {
        fs.createWriteStream(this.configPath);
      }
      fs.writeFileSync(this.configPath, JSON.stringify(newConfig));
    } catch (err) {
      log.error(err);
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
