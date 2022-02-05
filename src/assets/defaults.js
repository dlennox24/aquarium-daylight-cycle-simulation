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
  phases: {
    sunrise: {
      beginPos: 'sunrise',
      endPos: 'noon',
      start: '10:00',
      end: '11:00',
    },
    noon: {
      beginPos: 'noon',
      endPos: 'noon',
      start: '11:01',
      end: '16:59',
    },
    sunset: {
      beginPos: 'noon',
      endPos: 'sunset',
      start: '17:00',
      end: '18:00',
    },
    moonrise: {
      beginPos: 'sunset',
      endPos: 'moon',
      start: '18:00',
      end: '20:00',
    },
    moon: {
      beginPos: 'moon',
      endPos: 'moon',
      start: '18:00',
      end: '20:00',
    },
    moonset: {
      beginPos: 'moon',
      endPos: 'sunrise',
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
