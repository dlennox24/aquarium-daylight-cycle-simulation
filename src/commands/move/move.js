import StepperMotor from '../../class/StepperMotor';
import log from '../../utils/log';

const move = ({ from, to, config, execPython, stepperDelay_ms }) => {
  try {
    const steppers = Object.keys(config.motors).map((motorId, i) => {
      const motor = config.motors[motorId];

      try {
        log.text(`creating ${motorId}`, { tag: motorId });
        const stepperMotor = new StepperMotor(motor, execPython);
        log.success(`created motor!`, { tag: motorId });

        stepperMotor.move(from, to, stepperDelay_ms);

        return stepperMotor;
      } catch (error) {
        log.error(`Failed to start ${motorId}:\n     ${error}`);
      }
    });

    process.on('SIGINT', () => {
      steppers.forEach((stepperMotor) => {
        stepperMotor.destroy();
      });
    });
  } catch (err) {
    log.error(err);
  }
};

export default move;
