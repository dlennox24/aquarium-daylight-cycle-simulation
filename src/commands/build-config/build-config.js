import fs from 'fs';
import _ from 'lodash';
import defaultData from '../../assets/defaults';
import log from '../../utils/log';
import { roundFloat, timeDiff_ms } from '../../utils/utils';
const { resolve } = require('path');

// testing signed commits via gh-desktop

const createPhasesObj = (phases) => {
  // const { sunrise, sunset, moonrise, moonset } = phases;
  Object.keys(phases).forEach((phase) => {
    phases[phase] = {
      ...phases[phase],
      total_ms: timeDiff_ms(phases[phase].start, phases[phase].end),
    };
  });
  return phases;
  phases = {
    ...phases,
    sunrise: {
      ...sunrise,
      total_ms: timeDiff_ms(sunrise.start, sunrise.end),
    },
    noon: {
      start: sunrise.end,
      end: sunset.start,
      total_ms: timeDiff_ms(sunrise.end, sunset.start),
    },
    sunset: {
      ...sunset,
      total_ms: timeDiff_ms(sunset.start, sunset.end),
    },
    moonrise: {
      ...moonrise,
      total_ms: timeDiff_ms(moonrise.start, moonrise.end),
    },
    moon: {
      start: moonrise.end,
      end: moonset.start,
      total_ms: timeDiff_ms(moonrise.end, moonset.start),
    },
    moonset: {
      ...moonset,
      total_ms: timeDiff_ms(moonset.start, moonset.end),
    },
  };

  return phases;
};

const createMotorsArray = (config) => {
  const { totalLength_mm, stepsPerMm, gpioPins, microsteps, minDelay } =
    config.gearDriver;
  const { count, width_mm, gap_mm } = config.lightSpecs;

  const spacing_mm = roundFloat(totalLength_mm / (count + 1));

  let motors = {};
  for (let i = 1; i <= count; i++) {
    const id = `motor_${i}`;

    const lightCoords = {
      left: roundFloat((width_mm + gap_mm) * i - (width_mm + gap_mm) / 2),
      center: roundFloat(spacing_mm * i),
      right: roundFloat(
        totalLength_mm -
          (width_mm + gap_mm) * (count + 1 - i) +
          (width_mm + gap_mm) / 2
      ),
    };

    let motor = {
      id,
      coords: {
        sunrise: lightCoords.left,
        noon: lightCoords.center,
        sunset: lightCoords.right,
        moonrise: lightCoords.right,
        moon: lightCoords.center,
        moonset: lightCoords.left,
      },
      stepsPerMm: stepsPerMm[i - 1],
      microsteps,
      minDelay,
    };

    motor.gpioPins = {
      ...gpioPins,
      motor: gpioPins.motors[i - 1],
      switch: gpioPins.switches[i - 1],
    };
    delete motor.gpioPins.motors;
    delete motor.gpioPins.switches;

    motors[id] = motor;
  }
  return motors;
};

const readInputs = (inputsPath) => {
  try {
    return JSON.parse(fs.readFileSync(inputsPath));
  } catch (err) {
    log.error(err);
    return {};
  }
};

const exportConfig = (data, path) => {
  try {
    if (!fs.existsSync(path)) {
      fs.createWriteStream(path);
    }
    fs.writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    log.error(err);
  }
};

const buildConfig = ({ configPath, inputsPath }) => {
  let inputData = {};
  try {
    log.title('Building Config Files');
    log.text(`config path: ${resolve(configPath)}`);

    if (!fs.existsSync(inputsPath)) {
      log.warn(`no config inputs path found: ${resolve(inputsPath)}`);
      log.text(`using default config inputs`);
    } else {
      log.text(`config inputs path: ${resolve(inputsPath)}`);
      inputData = readInputs(inputsPath);
    }

    let config = _.defaultsDeep({}, inputData, defaultData);

    if (inputData.gearDriver?.gpioPins?.motors) {
      config.gearDriver.gpioPins.motors = inputData.gearDriver.gpioPins.motors;
      if (
        inputData.gearDriver.gpioPins.motors.length !== config.lightSpecs.count
      ) {
        throw `Motor GPIO Pins count and Light count are not equal (${inputData.gearDriver.gpioPins.motors.length} != ${config.lightSpecs.count}) `;
      }
    }

    if (inputData.gearDriver?.gpioPins?.switches) {
      config.gearDriver.gpioPins.switches =
        inputData.gearDriver.gpioPins.switches;
      if (
        inputData.gearDriver.gpioPins.switches.length !==
        config.lightSpecs.count
      ) {
        throw `Switch GPIO Pins count and Light count are not equal (${inputData.gearDriver.gpioPins.switches.length} !== ${config.lightSpecs.count}) `;
      }
    }

    if (
      config.gearDriver.totalLength_mm <
      config.lightSpecs.count *
        (config.lightSpecs.width_mm + config.lightSpecs.gap_mm)
    ) {
      throw `Total light size and spacing is greater than total length of track.`;
    }

    config.motors = createMotorsArray(config);
    config.phases = createPhasesObj(config.phases);
    config.buildDate = new Date();

    log.text(`generating config file`);

    exportConfig(config, configPath);
    log.success(`config successfully exported to ${resolve(configPath)}`);

    return config;
  } catch (error) {
    log.error(error);
  }

  return null;
};

export default buildConfig;
