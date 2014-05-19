#!/usr/bin/env python3

import unittest

import fskube

DEBUG = False

class Capturer(fskube.intReceiver):
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
        capturer = Capturer()

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

if __name__ == "__main__":
    unittest.main()
