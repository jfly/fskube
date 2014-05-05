#!/usr/bin/env python3
import fskube

class Printer(fskube.boolReceiver):
    def receive(self, sample):
        print("Decoded a %s" % sample)

def main():
    fskParams = fskube.FskParams()
    fskParams.samplesPerSecond = 41000
    fskParams.bitsPerSecond = 1200
    fskParams.markFrequency = 2200
    fskParams.spaceFrequency = 1200

    modulator = fskube.Modulator(fskParams)
    demodulator = fskube.Demodulator(fskParams)
    p = Printer()

    modulator.connect(demodulator)
    demodulator.connect(p)

    modulator.receive(1)
    modulator.receive(0)
    modulator.receive(1)
    demodulator.flush()

if __name__ == "__main__":
    main()
