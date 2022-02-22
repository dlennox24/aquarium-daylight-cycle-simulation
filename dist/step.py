import datetime
import getopt
import json
import sys
from time import sleep

import RPi.GPIO as GPIO

configString = ""
execType = ""
config = {}
stepResolution = 1

def setup():
  global configString, config

  print ('Program is starting...')

  config = json.loads(configString)
  # print(config)
  
  # setup output pins
  GPIO.setmode(GPIO.BCM)
  for pin in config['outPins']:
    GPIO.setup(pin,GPIO.OUT)
  #end for

  # setup input pins
  for pin in config['inPins']:
    GPIO.setup(pin,GPIO.IN)
  #end for
#end setup()

def destroy():
  # disable motor drive by setting pin to high
  GPIO.output(config['gpioPins']['enable'], GPIO.HIGH)
  # GPIO.cleanup()
  print('Program exited...')
#end destroy()

def parseArgs(argv):
  global configString, execType

  try:
     opts, args = getopt.getopt(argv,"hc:t:",["configString=","type="])
  except getopt.GetoptError:
    print('step.py -c <configString> -t <execType[move|calibrate]>')
    sys.exit(2)
  for opt, arg in opts:
    if opt == '-h':
      print('step.py -c <configString>')
      sys.exit()
    elif opt in ("-c", "--configString"):
      configString = arg
    elif opt in ("-t", "--type"):
      execType = arg
  #end for
  
  print('argv          :', argv)
  print('configString  :', configString)
#end parseArgs()

def doStep(totalDelay):
  GPIO.output(config['gpioPins']['motor'], GPIO.HIGH)
  sleep(totalDelay / 2)
  GPIO.output(config['gpioPins']['motor'], GPIO.LOW)
  sleep(totalDelay / 2)
#end doStep()


def move():
  global config, stepResolution

  # set direction pin output
  GPIO.output(config['gpioPins']['direction'], GPIO.HIGH if config['steps'] > 0 else GPIO.LOW)
  # set enable pin to low to enable motor drive
  GPIO.output(config['gpioPins']['enable'], GPIO.LOW)

  totalSteps = abs(config['steps'])
  totalDelay = abs(config['stepperDelay_ms']) * 0.001 # *0.001 to convert to sec from ms

  startTimeVar = datetime.datetime.now()
  currStepPerc = 0
  for step in range(totalSteps):
    nextStepPerc = round(step / totalSteps * 100)
    if nextStepPerc % 2 == 0 and nextStepPerc != currStepPerc:
      endTimeVar = datetime.datetime.now()
      print(str(nextStepPerc) + '% (' + str(step) + '/' + str(totalSteps) + ') ' + str(round((endTimeVar-startTimeVar).total_seconds()*1000)) + 'ms', end='')
      startTimeVar = endTimeVar
      currStepPerc = nextStepPerc
    doStep(totalDelay)
  #end for
#end move()

def calibrate():
  global config
  # set direction pin output
  GPIO.output(config['gpioPins']['direction'], GPIO.HIGH if config["calibrationDir"] == "west" else GPIO.LOW)
  # set enable pin to low to enable motor drive
  GPIO.output(config['gpioPins']['enable'], GPIO.LOW)

  totalDelay = abs(config['stepperDelay_ms']) * 0.001 # *0.001 to convert to sec from ms

  switchToName = ""
  while True:
    if not GPIO.input(config['gpioPins']['calibration0']):
      print('calibration0 switch found!')
      switchToName = "calibration1"
      break
    if not GPIO.input(config['gpioPins']['calibration1']):
      print('calibration1 switch found!')
      switchToName = "calibration0"
      break
    #end if
    doStep(totalDelay)
  #end while

  calSteps = 0
  while True:
    if(not GPIO.input(config['gpioPins'][switchToName])):
      break
    #end if

    doStep(totalDelay)
    calSteps += 1
  #end while
  
  stepsPerMm = calSteps / config["calibrationLength_mm"]
  dist_mm = 0.0

  if(switchToName == "calibration1"):
    sleep(1) # for direction switch
    # set to low to set direction to be easterly
    GPIO.output(config['gpioPins']['direction'], GPIO.LOW)
    dist_mm = config["calibrationLength_mm"] + config["calibrationSwitch0Pos"] - config["coords"]["sunrise"]
  else: 
    dist_mm = config["calibrationSwitch0Pos"] - config["coords"]["sunrise"]
  #end if else

  
  # reset to sunrise point
  for step in range(int(stepsPerMm * dist_mm)):
    doStep(totalDelay)
  #end for

  print("output_stepsPerMm:" + str(stepsPerMm), flush=True)
  sleep(1)

#end calibrate()

if __name__ == '__main__':
  print('==================')
  parseArgs(sys.argv[1:])
  print('==================')
  setup()
  try:
    startTimeVar = datetime.datetime.now()
    if execType == "move":
      print("moving")
      move()
    if execType == "calibrate":
      print("calibrating")
      calibrate()
    destroy()
    endTimeVar = datetime.datetime.now()
    print("Args Time: ", round((endTimeVar-startTimeVar).total_seconds()), "s")
    # print("Total Steps: ", stepsCount)
  except KeyboardInterrupt:
    destroy()
#end if
