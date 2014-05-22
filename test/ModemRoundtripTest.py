#!/usr/bin/env python3

import os
import wave
import struct
import unittest

import fskube

DEBUG = False
if DEBUG:
    os.environ["LOG_fskube"] = "*"

class Capturer(fskube.boolReceiver):
    def __init__(self):
        super().__init__()
        self.reset()

    def reset(self):
        self.bits = []

    def receive(self, bit):
        if DEBUG:
            print("received a %s" % bit)
        self.bits.append(int(bit))

@unittest.skip("<<<>>>")
class RoundtripTest(unittest.TestCase):
    
    def doRoundtrip(self, samplesPerSecond, bits):
        print("Roundtrip test at %shZ" % samplesPerSecond)

        fskParams = fskube.FskParams()
        fskParams.samplesPerSecond = samplesPerSecond
        fskParams.bitsPerSecond = 1200
        fskParams.markFrequency = 1200
        fskParams.spaceFrequency = 2400
        modulator = fskube.Modulator(fskParams)
        demodulator = fskube.Demodulator(fskParams)
        c = Capturer()
        modulator.connect(demodulator)
        demodulator.connect(c)

        for bit in bits:
            modulator.receive(bool(bit))

        demodulator.flush()

        self.assertEqual(c.bits, bits)

    def test(self):
        bits = [0,1,0,0,0,0,0,1,0,1,0,0,0,0,1]
        for samplesPerSecond in [ 48000, 44100, 16000 ]:
            self.doRoundtrip(samplesPerSecond, bits)

@unittest.skip("<<<>>>")
class DataTest(unittest.TestCase):

    maxDiff = None

    def test(self):
        testDataDir = os.path.join(os.path.dirname(os.path.realpath(__file__)), "data")

        def isTestData(filename):
            return filename.endswith(".testdata");

        tests = sorted(filter(isTestData, os.listdir(testDataDir)))
        for filename in tests:
            print("************ Testing " + filename + " **************")
            inDataFilename = os.path.join(testDataDir, filename)
            with open(inDataFilename) as f:
                data = f.read()
            data = data.split("\n")
            header = data.pop(0)
            correctBits = eval(data.pop(0)[1:])
            if type(correctBits) is str:
                correctBits = list(map(int, correctBits.replace(" ", "")))

            headerData = header[1:].strip().split(" ")
            def parseFrequency(freq):
                return int(headerData[0].lower().replace("hz", ""))
            samplesPerSecond = parseFrequency(headerData[0])
            onFrequency = parseFrequency(headerData[1])
            assert onFrequency
            offFrequency = parseFrequency(headerData[2])
            assert offFrequency

            fskParams = fskube.FskParams()
            fskParams.samplesPerSecond = samplesPerSecond
            fskParams.bitsPerSecond = 1200
            fskParams.markFrequency = 1200
            fskParams.spaceFrequency = 2400
            modulator = fskube.Modulator(fskParams)
            demodulator = fskube.Demodulator(fskParams)
            c = Capturer()
            modulator.connect(demodulator)
            demodulator.connect(c)

            if data[0].startswith("#"):
                # Treat this line as a wav file
                wavFilename = data[0][1:].strip()
                with open(os.path.join(testDataDir, wavFilename), 'rb') as f:
                    wav = wave.open(f)
                    # http://stackoverflow.com/a/2602334
                    nchannels = wav.getnchannels()
                    nframes = wav.getnframes()
                    frames = wav.readframes(nframes * nchannels)
                    out = struct.unpack_from("%dh" % nframes * nchannels, frames)
 
                    # Convert 2 channles to numpy arrays
                    if nchannels == 2:
                        left = out[0::2]
                        right = out[1::2]
                    else:
                        left = out
                        right = out

                c.reset()
                for sample in left:
                    demodulator.receive(sample)
                self.assertEqual(c.bits, correctBits)
            else:
                c.reset()
                for pair in data:
                    if len(pair.strip()) == 0:
                        continue
                    index_sample = pair.split(" ")
                    sampleIndex = int(index_sample[0])
                    sample = float(index_sample[1])
                    demodulator.receive(sample)
                demodulator.flush()
                self.assertEqual(c.bits, correctBits)
            print("************ " + filename + " passed! **************")

if __name__ == "__main__":
    unittest.main()
