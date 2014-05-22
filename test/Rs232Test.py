#!/usr/bin/env python3

import os
import random
import unittest

import fskube
import FskTest

class Rs232Test(FskTest.FskTest):
    def test(self):
        capturer = self.createCapturer(fskube.intReceiver)
        rs232or = fskube.Rs232or()
        deRs232or = fskube.DeRs232or()
        rs232or.connect(deRs232or)
        deRs232or.connect(capturer)
        
        secretMessage = "this is a message!"
        for ch in "this is a message!":
            rs232or.receive(ord(ch))

        receivedMessage = "".join(map(chr, capturer.data))
        self.assertEqual(receivedMessage, secretMessage)

        capturer.reset()
        # Send an idle, we expect to receive >= 1 idles.
        rs232or.receive(-1)
        self.assertGreaterEqual(len(capturer.data), 1)
        for ch in capturer.data:
            self.assertEqual(ch, -1)

class StackmatTest(FskTest.FskTest):
    def test(self):
        capturer = self.createCapturer(fskube.stackmatstateReceiver)
        synthesizer = fskube.StackmatSynthesizer()
        interpreter = fskube.StackmatInterpreter()
        synthesizer.connect(interpreter)
        interpreter.connect(capturer)

        sentStates = []
        for i in range(100):
            state = fskube.StackmatState()
            state.commandByte = random.randint(0, 255)
            state.millis = random.randint(0, 10*60*1000)
            state.generation = random.choice([2, 3])
            if state.generation == 2:
                # Zero out the thousandths place.
                state.millis = state.millis - state.millis % 10
            synthesizer.receive(state)
            sentStates.append(state)

        for sentState, receivedState in zip(sentStates, capturer.data):
            self.assertEqual(sentState.commandByte, receivedState.commandByte)
            self.assertEqual(sentState.generation, receivedState.generation)
            self.assertEqual(sentState.millis, receivedState.millis)

if __name__ == "__main__":
    unittest.main()
