import datetime
import getopt
import json
import sys
from time import sleep

import RPi.GPIO as GPIO

configString = ""
config = {}
stepResolution = 32

def setup():
  global configString, config

  print ('Program is starting...')

  config = json.loads(configString)
  # print(config)
  GPIO.setmode(GPIO.BCM)
  for pin in config['pins']:
    GPIO.setup(pin,GPIO.OUT)
  GPIO.output(config['gpioPins']['direction'], 1 if config['steps'] > 0 else 0)
  #end for

  # TODO remove
  # TEMP microstepping setup
  MODE = (14, 15, 18)
  GPIO.setup(MODE, GPIO.OUT)
  RESOLUTION = {
              '1': (0, 0, 0),
              '2': (1, 0, 0),
              '4': (0, 1, 0),
              '8': (1, 1, 0),
              '16': (0, 0, 1),
              '32': (1, 0, 1)
              }
  GPIO.output(MODE, RESOLUTION[str(stepResolution)])
#end setup()

def destroy():
  GPIO.cleanup()
  print('Program exited...')
#end destroy()

def parseArgs(argv):
  global configString

  try:
     opts, args = getopt.getopt(argv,"hc:i:",["configString="])
  except getopt.GetoptError:
    print('step.py -c <configString>')
    sys.exit(2)
  for opt, arg in opts:
    if opt == '-h':
      print('step.py -c <configString>')
      sys.exit()
    elif opt in ("-c", "--configString"):
      configString = arg
  #end for
  
  print('argv          :', argv)
  print('configString  :', configString)
#end parseArgs()

def move():
  global config, stepResolution
  totalSteps = abs(config['steps'])*stepResolution
  totalDelay = abs(config['delay']) * 0.001 / stepResolution

  for step in range(totalSteps):
    if (step / totalSteps * 100) % 10 == 0:
      print(str(step / totalSteps * 100) + '%')
    GPIO.output(config['gpioPins']['motor'], GPIO.HIGH)
    sleep(totalDelay / 2)
    GPIO.output(config['gpioPins']['motor'], GPIO.LOW)
    sleep(totalDelay / 2)
  #end for
#end move()

if __name__ == '__main__':
  print('==================')
  parseArgs(sys.argv[1:])
  print('==================')
  setup()
  try:
    startTimeVar = datetime.datetime.now()
    move()
    destroy()
    endTimeVar = datetime.datetime.now()
    print("Args Time: ", (endTimeVar-startTimeVar).total_seconds() * 1000)
    # print("Total Steps: ", stepsCount)
  except KeyboardInterrupt:
    destroy()
#end if
