export default {
  times: {
    sunrise: {
      start: '09:59',
      end: '10:00',
    },
    sunset: {
      start: '16:50',
      end: '17:00',
    },
    moonrise: {
      start: '17:00',
      end: '19:00',
    },
  },
  gearDriver: {
    totalLength_mm: 300,
    gpioPins: {
      motors: [1],
      switches: [5],
      calibration: 13,
      direction: 9,
      sleep: 10,
      enable: 11,
    },
  },
  lightSpecs: { count: 1, width_mm: 127, gap_mm: 5 },
};
