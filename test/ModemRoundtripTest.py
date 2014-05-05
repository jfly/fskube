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
        self.bits.append(bit)

class RoundtripTest(unittest.TestCase):
    def test(self):
        fskParams = fskube.FskParams()
        fskParams.samplesPerSecond = 41000
        fskParams.bitsPerSecond = 1200
        fskParams.markFrequency = 2200
        fskParams.spaceFrequency = 1200

        modulator = fskube.Modulator(fskParams)
        demodulator = fskube.Demodulator(fskParams)
        c = Capturer()

        modulator.connect(demodulator)
        demodulator.connect(c)

        bits = [1, 0, 1]
        for bit in bits:
            modulator.receive(bit)

        demodulator.flush()

        self.assertEqual(c.bits, bits)

if __name__ == "__main__":
    unittest.main()
