import os
import time
import random
import unittest

randomSeed = os.environ.get('RANDOM_SEED')
if randomSeed is None:
    randomSeed = str(int(time.time()))
print("Setting random seed to {} (set RANDOM_SEED environment variable to override)".format(randomSeed))
random.seed(randomSeed)

class FskTest(unittest.TestCase):
    maxDiff = None

    def __init__(self, *args, debug=False, **kwargs):
        super().__init__(*args, **kwargs)
        self.debug = debug
        if self.debug:
            os.environ["LOG_fskube"] = "*"

    def createCapturer(self, capturerType):
        test = self
        class Capturer(capturerType):
            def __init__(self):
                super().__init__()
                self.reset()

            def reset(self):
                self.data = []

            def receive(self, datum):
                # This is a hack to copy datum into python's heap. datum may
                # be a python wrapper for something in a c++ stack that will
                # go away after we return from this function. See fskube.i
                # for a typemap hack for StackmatState that works on swig3,
                # but doesn't seem to work with swig2.
                datum = type(datum)(datum)

                test.log("received a %s" % datum)
                self.data.append(datum)
        return Capturer()

    def log(self, *args, **kwargs):
        if self.debug:
            print(*args, **kwargs)
