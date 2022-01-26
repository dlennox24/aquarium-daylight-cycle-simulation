'use strict';

require('core-js/stable');
var fs = require('fs');
require('regenerator-runtime/runtime');
var child_process = require('child_process');
var path = require('path');
var chalk = require('chalk');
var util = require('util');
var luxon = require('luxon');
var _ = require('lodash');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var chalk__default = /*#__PURE__*/_interopDefaultLegacy(chalk);
var util__default = /*#__PURE__*/_interopDefaultLegacy(util);
var ___default = /*#__PURE__*/_interopDefaultLegacy(_);

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = null != arguments[i] ? arguments[i] : {};
    i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }

  return target;
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var title = function title(t) {
  var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref$indent = _ref.indent,
      indent = _ref$indent === void 0 ? 0 : _ref$indent;
      _ref.tag;

  return console.log("\n".concat(' '.repeat(indent)).concat(chalk__default["default"].bgCyan.black(" ".concat(t, " "))));
};

var subtitle = function subtitle(t) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref2$indent = _ref2.indent,
      indent = _ref2$indent === void 0 ? 1 : _ref2$indent;
      _ref2.tag;

  return console.log("".concat(' '.repeat(indent)).concat(chalk__default["default"].bgMagenta.black(" ".concat(t, " "))));
};

var success = function success(t) {
  var _ref3 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref3$indent = _ref3.indent,
      indent = _ref3$indent === void 0 ? 1 : _ref3$indent,
      _ref3$tag = _ref3.tag,
      tag = _ref3$tag === void 0 ? '' : _ref3$tag;

  console.log("".concat(' '.repeat(indent)).concat(chalk__default["default"].black.bgGreen(" ".concat(tag + (tag && ' '))), " ").concat(chalk__default["default"].green(t)));
};

var warn = function warn(t) {
  var _ref4 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref4$indent = _ref4.indent,
      indent = _ref4$indent === void 0 ? 1 : _ref4$indent,
      _ref4$tag = _ref4.tag,
      tag = _ref4$tag === void 0 ? '' : _ref4$tag;

  console.warn("".concat(' '.repeat(indent)).concat(chalk__default["default"].black.bgYellow(" ".concat(tag + (tag && ' '))), " ").concat(chalk__default["default"].yellow(t)));
};

var error = function error(t) {
  var _ref5 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref5$indent = _ref5.indent,
      indent = _ref5$indent === void 0 ? 1 : _ref5$indent,
      _ref5$tag = _ref5.tag,
      tag = _ref5$tag === void 0 ? '' : _ref5$tag;

  console.error("".concat(' '.repeat(indent)).concat(chalk__default["default"].black.bgRed(" ".concat(tag + (tag && ' '))), " ").concat(chalk__default["default"].red(t)));
};

var text = function text(t) {
  var _ref6 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
      _ref6$indent = _ref6.indent,
      indent = _ref6$indent === void 0 ? 1 : _ref6$indent,
      _ref6$tag = _ref6.tag,
      tag = _ref6$tag === void 0 ? '' : _ref6$tag;

  console.log("".concat(' '.repeat(indent)).concat(chalk__default["default"].black.bgWhite(" ".concat(tag + (tag && ' '))), " ").concat(chalk__default["default"].white(t)));
};

var object = function object(o) {
  return console.log(util__default["default"].inspect(o, false, null, true));
};

var log = {
  error: error,
  object: object,
  subtitle: subtitle,
  success: success,
  text: text,
  title: title,
  warn: warn
};

var roundInt = function roundInt(num) {
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var radix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
  return parseInt(Number(num).toFixed(length), radix);
};
var roundFloat = function roundFloat(num) {
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var radix = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
  return parseFloat(Number(num).toFixed(length), radix);
};
var timeDiff_ms = function timeDiff_ms(start, end) {
  return luxon.DateTime.fromFormat(end, 'HH:mm').diff(luxon.DateTime.fromFormat(start, 'HH:mm')).toObject().milliseconds;
}; // Pauses JS execution thread: https://www.sitepoint.com/delay-sleep-pause-wait/

var StepperMotor = /*#__PURE__*/function () {
  function StepperMotor(motor) {
    _classCallCheck(this, StepperMotor);

    this.id = motor.id;
    this.coords = motor.coords;
    this.gpioPins = motor.gpioPins;
    this.stepsPerMm = motor.stepsPerMm;
    this.stepCount = 0;
    this.pythonProcess = null;
  }

  _createClass(StepperMotor, [{
    key: "move",
    value: function move(from, to, time_ms) {
      log.text("move: ".concat(from, " \u2192 ").concat(to), {
        tag: this.id
      });
      var dist_mm = this.coords[to] - this.coords[from];
      var steps = roundInt(this.stepsPerMm * dist_mm);
      var delay = roundFloat(time_ms / steps);
      log.text("coords: ".concat(this.coords[from], " \u2192 ").concat(this.coords[to], " (").concat(dist_mm, "mm)"), {
        tag: this.id
      });
      log.text("steps: ".concat(steps, " (").concat(dist_mm, " mm * ").concat(this.stepsPerMm, " s/mm)"), {
        tag: this.id
      });
      log.text("delay: ".concat(delay), {
        tag: this.id
      });
    }
  }, {
    key: "doFullSteps",
    value: function doFullSteps(args) {
      var _this = this;

      var isReversed = args.isReversed,
          delay = args.delay,
          steps = args.steps;
      delay = delay >= 2 ? delay : 2;
      steps = steps >= 1 ? steps : 1;
      var stepOrder = ['1100', '0110', '0011', '1001'];

      if (isReversed) {
        stepOrder.reverse();
      }

      this.pythonProcess = child_process.spawn('python3', ['-u', path__default["default"].join(__dirname, 'step.py'), '-d', delay, '-p', this.gpioPins.toString(), '-s', steps, '-o', stepOrder.toString()]);
      this.pythonProcess.stdout.on('data', function (data) {
        log.text(data, {
          tag: _this.id
        });
      });
      this.pythonProcess.stderr.on('data', function (data) {
        log.error(data, {
          tag: _this.id
        });
      });
      this.pythonProcess.stderr.on('close', function () {
        log.text('closed', {
          tag: _this.id
        });
      });
      return this.pythonProcess;
    }
  }, {
    key: "resetStepCount",
    value: function resetStepCount() {
      this.stepCount = 0;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      console.log('...done');
    }
  }]);

  return StepperMotor;
}();

var defaultData = {
  gearDriver: {
    totalLength_mm: 1820,
    stepsPerMm: [25, 21, 23, 26],
    gpioPins: {
      motors: [1, 2, 3, 4],
      switches: [5, 6, 7, 8],
      calibration: 12,
      direction: 9,
      sleep: 10,
      enable: 11
    }
  },
  times: {
    sunrise: {
      start: '10:00',
      end: '11:00'
    },
    sunset: {
      start: '17:00',
      end: '18:00'
    },
    moonrise: {
      start: '18:00',
      end: '20:00'
    }
  },
  lightSpecs: {
    count: 4,
    width_mm: 127,
    gap_mm: 5
  },
  motors: []
};

var inputData = {
  times: {
    sunrise: {
      start: '09:59',
      end: '10:00'
    },
    sunset: {
      start: '16:50',
      end: '17:00'
    },
    moonrise: {
      start: '17:00',
      end: '19:00'
    }
  },
  gearDriver: {
    totalLength_mm: 300,
    gpioPins: {
      motors: [1],
      switches: [5],
      calibration: 13,
      direction: 9,
      sleep: 10,
      enable: 11
    }
  },
  lightSpecs: {
    count: 1,
    width_mm: 127,
    gap_mm: 5
  }
};

var _require$1 = require('path'),
    resolve$1 = _require$1.resolve;

var createTimesObj = function createTimesObj(times) {
  var _times = times,
      sunrise = _times.sunrise,
      sunset = _times.sunset,
      moonrise = _times.moonrise;
  times = _objectSpread2(_objectSpread2({}, times), {}, {
    sunrise: _objectSpread2(_objectSpread2({}, sunrise), {}, {
      total_ms: timeDiff_ms(sunrise.start, sunrise.end)
    }),
    noon: {
      start: sunrise.end,
      end: sunset.start,
      total_ms: timeDiff_ms(sunrise.end, sunset.start)
    },
    sunset: _objectSpread2(_objectSpread2({}, sunset), {}, {
      total_ms: timeDiff_ms(sunset.start, sunset.end)
    }),
    moonrise: _objectSpread2(_objectSpread2({}, moonrise), {}, {
      total_ms: timeDiff_ms(moonrise.start, moonrise.end)
    })
  });
  return times;
};

var createMotorsArray = function createMotorsArray(config) {
  var _config$gearDriver = config.gearDriver,
      totalLength_mm = _config$gearDriver.totalLength_mm,
      stepsPerMm = _config$gearDriver.stepsPerMm,
      gpioPins = _config$gearDriver.gpioPins;
  var _config$lightSpecs = config.lightSpecs,
      count = _config$lightSpecs.count,
      width_mm = _config$lightSpecs.width_mm,
      gap_mm = _config$lightSpecs.gap_mm;
  var spacing_mm = roundFloat(totalLength_mm / (count + 1));
  var motors = [];

  for (var i = 1; i <= count; i++) {
    var motor = {
      id: "motor_".concat(i),
      coords: {
        sunrise: roundFloat((width_mm + gap_mm) * i - (width_mm + gap_mm) / 2),
        noon: roundFloat(spacing_mm * i),
        sunset: roundFloat(totalLength_mm - (width_mm + gap_mm) * (count + 1 - i) + (width_mm + gap_mm) / 2),
        moon: roundFloat(spacing_mm * i)
      },
      stepsPerMm: stepsPerMm[i - 1]
    };
    motor.gpioPins = {
      motor: gpioPins.motors[i - 1],
      "switch": gpioPins.switches[i - 1]
    };
    motors.push(motor);
  }

  return motors;
};

var exportConfig = function exportConfig(data, path) {
  try {
    if (!fs__default["default"].existsSync(path)) {
      fs__default["default"].createWriteStream(path);
    }

    fs__default["default"].writeFileSync(path, JSON.stringify(data));
  } catch (err) {
    log.error(err);
  }
};

var buildConfig = function buildConfig(_ref) {
  var _inputData$gearDriver, _inputData$gearDriver2, _inputData$gearDriver3, _inputData$gearDriver4;

  var _ref$configPath = _ref.configPath,
      configPath = _ref$configPath === void 0 ? './config.json' : _ref$configPath;
  log.title('Building Config Files');
  log.text("config path: ".concat(configPath));

  var config = ___default["default"].defaultsDeep({}, inputData, defaultData);

  if ((_inputData$gearDriver = inputData.gearDriver) !== null && _inputData$gearDriver !== void 0 && (_inputData$gearDriver2 = _inputData$gearDriver.gpioPins) !== null && _inputData$gearDriver2 !== void 0 && _inputData$gearDriver2.motors) {
    config.gearDriver.gpioPins.motors = inputData.gearDriver.gpioPins.motors;
  }

  if ((_inputData$gearDriver3 = inputData.gearDriver) !== null && _inputData$gearDriver3 !== void 0 && (_inputData$gearDriver4 = _inputData$gearDriver3.gpioPins) !== null && _inputData$gearDriver4 !== void 0 && _inputData$gearDriver4.switches) {
    config.gearDriver.gpioPins.switches = inputData.gearDriver.gpioPins.switches;
  }

  config.motors = createMotorsArray(config);
  config.times = createTimesObj(config.times);
  config.buildDate = new Date();
  log.text("generating config file");

  try {
    exportConfig(config, configPath); // log.object(config);

    log.success("config successfully exported to ".concat(resolve$1(configPath)));
    return config;
  } catch (err) {
    log.error(err);
  }

  return null;
};

var _require = require('path'),
    resolve = _require.resolve;

var argv = require('minimist')(process.argv.slice(2));

var _argv$configPath = argv.configPath,
    configPath = _argv$configPath === void 0 ? './config.json' : _argv$configPath,
    from = argv.from,
    to = argv.to,
    _argv$rebuild = argv.rebuild,
    rebuild = _argv$rebuild === void 0 ? false : _argv$rebuild;

var start = function start() {
  log.title('Starting Python Execution');

  try {
    var config = JSON.parse(fs__default["default"].readFileSync(configPath, 'utf8'));
    log.success("config found! ".concat(resolve(configPath)));
    log.text("config build: ".concat(new Date(config.buildDate).toGMTString()));
    var steppers = config.motors.map(function (motor, i) {
      var id = motor.id,
          gpioPins = motor.gpioPins;

      try {
        var time_ms = 5 * 60 * 1000;

        if (from === 'sunrise' && to === 'noon') {
          time_ms = config.times.sunrise.total_ms;
        }

        if (from === 'noon' && to === 'sunset') {
          time_ms = config.times.sunset.total_ms;
        }

        log.text("creating ".concat(id), {
          tag: id
        });
        var stepperMotor = new StepperMotor(motor);
        log.success("created motor!", {
          tag: id
        });
        stepperMotor.move(from, to, time_ms);
        return stepperMotor;
      } catch (error) {
        log.error("Failed to start ".concat(id, ":\n     ").concat(error));
      } //   stepperMotor.doFullSteps({
      //     steps: motor.sunrise.steps,
      //     delay: motor.sunrise.delay,
      //   });
      //   stepperMotor.destroy();

    }); // // const m1 = new StepperMotor(config.motors[0]);
    // // m1.doFullSteps({ steps: 1024, delay: 500 });
    // // m1.destroy();

    process.on('SIGINT', function () {
      steppers.forEach(function (stepperMotor) {
        stepperMotor.destroy();
      });
    });
  } catch (err) {
    log.error(err);
  }
};

log.title('Starting Sunrise/set Sim');
log.text("route: ".concat(from, " \u2192 ").concat(to));

if (rebuild || !fs__default["default"].existsSync(configPath)) {
  if (!fs__default["default"].existsSync(configPath)) {
    log.warn("no config file found: ".concat(resolve(configPath)));
  }

  buildConfig({
    configPath: configPath
  });
}

if (to && from) {
  start();
} else {
  if (!to) {
    log.error("invalid `to` arg: '".concat(to, "'. must be one of [sunrise, noon, sunset, moon]"));
  }

  if (!from) {
    log.error("invalid `from` arg: '".concat(from, "'. must be one of [sunrise, noon, sunset, moon]"));
  }
}
