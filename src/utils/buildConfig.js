import fs from 'fs';
import _ from 'lodash';
import defaultData from '../assets/defaults';
import inputData from '../assets/input';
import log from './log';
import { roundFloat, timeDiff_ms } from './utils';
const { resolve } = require('path');

const createTimesObj = (times) => {
  const { sunrise, sunset, moonrise } = times;
  times = {
    ...times,
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
  };

  return times;
};

const createMotorsArray = (config) => {
  const { totalLength_mm, stepsPerMm, gpioPins } = config.gearDriver;
  const { count, width_mm, gap_mm } = config.lightSpecs;

  const spacing_mm = roundFloat(totalLength_mm / (count + 1));

  let motors = [];
  for (let i = 1; i <= count; i++) {
    let motor = {
      id: `motor_${i}`,
      coords: {
        sunrise: roundFloat((width_mm + gap_mm) * i - (width_mm + gap_mm) / 2),
        noon: roundFloat(spacing_mm * i),
        sunset: roundFloat(
          totalLength_mm -
            (width_mm + gap_mm) * (count + 1 - i) +
            (width_mm + gap_mm) / 2
        ),
        moon: roundFloat(spacing_mm * i),
      },
      stepsPerMm: stepsPerMm[i - 1],
    };

    motor.gpioPins = {
      motor: gpioPins.motors[i - 1],
      switch: gpioPins.switches[i - 1],
    };

    motors.push(motor);
  }
  return motors;
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

const buildConfig = ({ configPath = './config.json' }) => {
  log.title('Building Config Files');
  log.text(`config path: ${configPath}`);
  let config = _.defaultsDeep({}, inputData, defaultData);

  if (inputData.gearDriver?.gpioPins?.motors) {
    config.gearDriver.gpioPins.motors = inputData.gearDriver.gpioPins.motors;
  }

  if (inputData.gearDriver?.gpioPins?.switches) {
    config.gearDriver.gpioPins.switches =
      inputData.gearDriver.gpioPins.switches;
  }

  config.motors = createMotorsArray(config);
  config.times = createTimesObj(config.times);
  config.buildDate = new Date();

  log.text(`generating config file`);
  try {
    exportConfig(config, configPath);
    // log.object(config);
    log.success(`config successfully exported to ${resolve(configPath)}`);
    return config;
  } catch (err) {
    log.error(err);
  }
  return null;
};

export default buildConfig;
