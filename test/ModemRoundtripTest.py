#!/usr/bin/env python3

import unittest

import fskube

class Capturer(fskube.boolReceiver):
    def __init__(self):
        super().__init__()
        self.reset()

    def reset(self):
        self.bits = []

    def receive(self, bit):
        self.bits.append(bit + 0)

class RoundtripTest(unittest.TestCase):
    
    def doRoundtrip(self, samplesPerSecond, bits):
        print("Roundtrip test at %shZ" % samplesPerSecond)
        fskParams = fskube.FskParams()
        fskParams.samplesPerSecond = samplesPerSecond
        fskParams.bitsPerSecond = 1200
        fskParams.markFrequency = 2200
        fskParams.spaceFrequency = 1200

        modulator = fskube.Modulator(fskParams)
        demodulator = fskube.Demodulator(fskParams)
        c = Capturer()

        modulator.connect(demodulator)
        demodulator.connect(c)

        for bit in bits:
            modulator.receive(bit)

        demodulator.flush()

        self.assertEqual(c.bits, bits)

    def test(self):
        bits = [0,1,0,0,0,0,0,1,0,1,0,0,0,0,1]
        for samplesPerSecond in [ 48000, 44100, 16000 ]:
            self.doRoundtrip(samplesPerSecond, bits)

if __name__ == "__main__":
    unittest.main()
