import sys, getopt
import RPi.GPIO as GPIO
import time 
import datetime

steps = 0
pins = []
delay = 2
stepOrder = []

def setup():
  global pins

  print ('Program is starting...')
  GPIO.setmode(GPIO.BCM)
  for pin in pins:
    GPIO.setup(pin,GPIO.OUT)

def doFullSteps():
  global steps, pins, delay, stepOrder

  for i in range(steps):
    microstep = list(stepOrder[i%4])
    for j in range(4):
      GPIO.output(pins[j], int(microstep[j]))
      j=1+1
    
    print(i)
    time.sleep(delay*0.001)

def destroy():
  GPIO.cleanup()
  print('Program exited...')

def parseArgs(argv):
  global steps, pins, delay, stepOrder

  try:
     opts, args = getopt.getopt(argv,"hd:p:s:o:",["delay=","pins=","steps=", "steporder="])
  except getopt.GetoptError:
    print('step.py -d <delay> -p <pinsCsv> -s <steps> -o <stepOrder(csv)>')
    sys.exit(2)
  for opt, arg in opts:
    if opt == '-h':
      print('step.py -d <delay> -p <pinsCsv> -s <steps> -o <stepOrder(csv)>')
      sys.exit()
    elif opt in ("-d", "--delay"):
      delay = float(arg)
    elif opt in ("-p", "--pins"):
      pins = [int(i) for i in arg.split(',')]
    elif opt in ("-o", "--steporder"):
      stepOrder = arg.split(',')
    elif opt in ("-s", "--steps"):
      steps = int(arg)
  
  print('ARGV       :',argv)
  print('DELAY      :', delay)
  print('PINS       :', pins)
  print('STEPS      :', steps)
  print('STEPORDER  :', stepOrder)

if __name__ == '__main__':
  print('==================')
  parseArgs(sys.argv[1:])
  print('==================')
  setup()
  try:
    # startTimeVar = datetime.datetime.now()
    doFullSteps()
    destroy()
    # endTimeVar = datetime.datetime.now()
    # print("Args Time: ", (endTimeVar-startTimeVar).total_seconds() * 1000)
    # print("Total Steps: ", stepsCount)
  except KeyboardInterrupt:
    destroy()
