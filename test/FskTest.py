import os
import time
import random
import unittest

import fskube

lh = fskube.LOG_HANDLE()

RANDOM_SEED_ENV_VAR = 'RANDOM_SEED'
randomSeed = os.environ.get(RANDOM_SEED_ENV_VAR)
if randomSeed is None:
    randomSeed = str(int(time.time()))
lh.log0("Setting random seed to {} (set {} "
        "environment variable to override)".format(randomSeed, RANDOM_SEED_ENV_VAR))
random.seed(randomSeed)

class FskTest(unittest.TestCase):
    maxDiff = None

    def createCapturer(self, capturerType):
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

                lh.log4("received a %s" % datum)
                self.data.append(datum)
        return Capturer()
