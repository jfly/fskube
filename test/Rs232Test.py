#!/usr/bin/env python3

import os
import unittest

import fskube

DEBUG = True
if DEBUG:
    os.environ["LOG_fskube"] = "*"

class CharCapturer(fskube.intReceiver):
    def __init__(self):
        super().__init__()
        self.reset()

    def reset(self):
        self.chars = []

    def receive(self, char):
        if DEBUG:
            print("received a %s" % char)
        self.chars.append(char)

class Rs232Test(unittest.TestCase):
    def test(self):
        capturer = CharCapturer()
        rs232or = fskube.Rs232or()
        deRs232or = fskube.DeRs232or()
        rs232or.connect(deRs232or)
        deRs232or.connect(capturer)
        
        secretMessage = "this is a message!"
        for ch in "this is a message!":
            rs232or.receive(ord(ch))

        receivedMessage = "".join(map(chr, capturer.chars))
        self.assertEqual(receivedMessage, secretMessage)

        capturer.reset()
        # Send an idle, we expect to receive >= 1 idles.
        rs232or.receive(-1)
        self.assertGreaterEqual(len(capturer.chars), 1)
        for ch in capturer.chars:
            self.assertEqual(ch, -1)

class StackmatStateCapturer(fskube.stackmatstateReceiver):
    def __init__(self):
        super().__init__()
        self.reset()

    def reset(self):
        self.states = []

    def receive(self, state):
        if DEBUG:
            print("received a %s" % state)
        self.states.append(state)

class StackmatTest(unittest.TestCase):
    def test(self):
        capturer = StackmatStateCapturer()
        synthesizer = fskube.StackmatSynthesizer()
        interpreter = fskube.StackmatInterpreter()
        synthesizer.connect(interpreter)
        interpreter.connect(capturer)

        sentStates = []
        for i in range(100):
            state = fskube.StackmatState()
            state.commandByte = '!'
            state.millis = 9990
            state.generation = 2
            synthesizer.receive(state)
            sentStates.append(state)

        for sentState, receivedState in zip(sentStates, capturer.states):
            self.assertEqual(sentState.commandByte, receivedState.commandByte)
            self.assertEqual(sentState.generation, receivedState.generation)
            self.assertEqual(sentState.millis, receivedState.millis)

if __name__ == "__main__":
    unittest.main()
