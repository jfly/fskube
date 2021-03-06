#!/usr/bin/env python3

import os
import wave
import struct
import unittest

import fskube
import FskTest

lh = fskube.LOG_HANDLE()

class RoundtripTest(FskTest.FskTest):

    def setUp(self):
        self.bits = [0,1,0,0,0,0,0,1,0,1,0,0,0,0,1]
    
    def doRoundtrip(self, samplesPerSecond, bits):
        lh.log1("Roundtrip test at %shZ" % samplesPerSecond)

        fskParams = fskube.FskParams()
        fskParams.samplesPerSecond = samplesPerSecond
        fskParams.bitsPerSecond = 1200
        fskParams.markFrequency = 1200
        fskParams.spaceFrequency = 2400
        modulator = fskube.Modulator(fskParams)
        demodulator = fskube.Demodulator(fskParams)
        c = self.createCapturer(fskube.boolReceiver)
        modulator.connect(demodulator)
        demodulator.connect(c)

        for bit in bits:
            modulator.receive(bool(bit))

        demodulator.flush()

        c.data = list(map(int, c.data))
        self.assertEqual(c.data, bits)

    def test_48000(self):
        self.doRoundtrip(48000, self.bits)

    def test_44100(self):
        self.doRoundtrip(44100, self.bits)

    @unittest.skip("Not supported")
    def test_16000(self):
        self.doRoundtrip(16000, self.bits)

class DataTest(FskTest.FskTest):

    def test(self):
        testDataDir = os.path.join(os.path.dirname(os.path.realpath(__file__)), "data")

        def isTestData(filename):
            return filename.endswith(".testdata");

        tests = sorted(filter(isTestData, os.listdir(testDataDir)))
        for filename in tests:
            lh.log1("************ Testing " + filename + " **************")
            inDataFilename = os.path.join(testDataDir, filename)
            with open(inDataFilename) as f:
                data = f.read()
            data = data.split("\n")
            header = data.pop(0)
            correctBits = eval(data.pop(0)[1:])
            if type(correctBits) is str:
                correctBits = list(map(int, correctBits.replace(" ", "")))

            def parseInt(freq, suffix):
                return int(freq.lower().replace(suffix.lower(), ""))

            c = self.createCapturer(fskube.boolReceiver)
            headerData = header[1:].strip().split(" ")
            sampleReceiver = None
            if len(headerData) == 2:
                # This is raw data, no modem involved
                samplesPerSecond = parseInt(headerData[0], suffix="Hz")
                bitsPerSecond = parseInt(headerData[1], suffix="bps")
                sampleReceiver = fskube.Digitizer(samplesPerSecond, bitsPerSecond)
                sampleReceiver.connect(c)
            else:
                assert len(headerData) == 4
                # This is raw data, no modem involved
                samplesPerSecond = parseInt(headerData[0], suffix="Hz")
                onFrequency = parseInt(headerData[1], suffix="Hz")
                offFrequency = parseInt(headerData[2], suffix="Hz")
                bitsPerSecond = parseInt(headerData[3], suffix="bps")

                fskParams = fskube.FskParams()
                fskParams.samplesPerSecond = samplesPerSecond
                fskParams.bitsPerSecond = bitsPerSecond
                fskParams.markFrequency = onFrequency
                fskParams.spaceFrequency = offFrequency
                sampleReceiver = fskube.Demodulator(fskParams)
                sampleReceiver.connect(c)

            if data[0].startswith("#"):
                # Treat this line as a wav file
                wavFilename = data[0][1:].strip()
                with open(os.path.join(testDataDir, wavFilename), 'rb') as f:
                    wav = wave.open(f)
                    # http://stackoverflow.com/a/2602334
                    nchannels = wav.getnchannels()
                    nframes = wav.getnframes()
                    frames = wav.readframes(nframes * nchannels)
                    out = struct.unpack_from("%dh" % (nframes * nchannels), frames)
                    if nchannels == 2:
                        left = out[0::2]
                        right = out[1::2]
                    else:
                        left = out
                        right = out

                c.reset()
                minsample = -(2**(8*wav.getsampwidth() - 1))
                maxsample = -minsample - 1
                for index, sample in enumerate(left):
                    if sample >= 0:
                        sample = (1.0*sample) / maxsample
                    else:
                        sample = (-1.0*sample) / minsample
                    lh.log2("%s: %s" % (index, sample))
                    sampleReceiver.receive(sample)
                c.data = list(map(int, c.data))
                self.assertEqual(c.data, correctBits)
            else:
                c.reset()
                for pair in data:
                    if len(pair.strip()) == 0:
                        continue
                    index_sample = pair.split(" ")
                    sampleIndex = int(index_sample[0])
                    sample = float(index_sample[1])
                    sampleReceiver.receive(sample)
                sampleReceiver.flush()
                c.data = list(map(int, c.data))
                self.assertEqual(c.data, correctBits)
            lh.log1("************ " + filename + " passed! **************")

if __name__ == "__main__":
    unittest.main()
