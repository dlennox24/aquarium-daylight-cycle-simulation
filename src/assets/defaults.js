export default {
  gearDriver: {
    totalLength_mm: 1820,
    stepsPerMm: [160, 160, 160, 160], // 5 steps/mm * 32 microsteps
    microsteps: 32,
    minDelay: 0.00625, // 1/160 ms
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
    moonset: {
      start: '00:00',
      end: '01:00',
    },
  },
  lightSpecs: {
    count: 4,
    width_mm: 127,
    gap_mm: 5,
  },
  motors: {},
};
