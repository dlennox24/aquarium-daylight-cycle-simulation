export default {
  gearDriver: {
    totalLength_mm: 1820,
    stepsPerMm: [25, 21, 23, 26],
    gpioPins: {
      motors: [1, 2, 3, 4],
      switches: [5, 6, 7, 8],
      calibration: 12,
      direction: 9,
      sleep: 10,
      enable: 11,
    },
  },
  times: {
    sunrise: {
      start: '10:00',
      end: '11:00',
    },
    sunset: {
      start: '17:00',
      end: '18:00',
    },
    moonrise: {
      start: '18:00',
      end: '20:00',
    },
  },
  lightSpecs: {
    count: 4,
    width_mm: 127,
    gap_mm: 5,
  },
  motors: [],
};
