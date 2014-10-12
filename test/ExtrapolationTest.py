#!/usr/bin/env python3

import time
import unittest

import fskube
import FskTest

SAMPLE_RATE = 8000

class ExtrapolationTest(FskTest.FskTest):
    def test(self):
        stackmatSythesizer = fskube.StackmatSynthesizer()

        rs232Synthesizer = fskube.Rs232Synthesizer()

        analogizer = fskube.Analogizer()
        analogizer.setSamplesPerSecond(SAMPLE_RATE)
        analogizer.setBitsPerSecond(1200)

        sampler = self.createCapturer(fskube.doubleReceiver)

        stackmatSythesizer.connect(rs232Synthesizer)
        rs232Synthesizer.connect(analogizer)
        analogizer.connect(sampler)

        fskube.fskube_initialize(SAMPLE_RATE)

        # Send two states with incrementing times to simulate a running stackmat.
        # We only extrapolate the signal when we think that the timer is running.
        state = fskube.StackmatState()
        state.millis = 40
        stackmatSythesizer.receive(state)
        state.millis = 500
        stackmatSythesizer.receive(state)
        for sample in sampler.data:
            fskube.fskube_addSample(sample)

        # Stop sending signals. Wait a little while, and verify that the signal
        # is extrapolated.
        lastSignalMillis = fskube.fskube_getState().millis
        sleepSecs = 1
        time.sleep(sleepSecs)
        currentSignalMillis = fskube.fskube_getState().millis
        import pdb; pdb.set_trace()#<<<
        self.assertGreaterEqual(currentSignalMillis, lastSignalMillis + sleepSecs*1000)

if __name__ == "__main__":
    unittest.main()
