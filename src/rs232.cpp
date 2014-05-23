#include "rs232.h"
#include "logging.h"

namespace fskube {

LOG_HANDLE("rs232")

Rs232or::Rs232or() {}

void Rs232or::receive(int data) {
    if(data < 0) {
        // Send our "idle" signal (low) for a good little while.
        for(int j = 0; j < 8*3; j++) {
            send(0);
        }
        return;
    } else {
        // start signal (high)
        send(1);
        
        // send bits of char, least significant first (little endian)
        for(int i = 0; i < 8; i++) {
            bool bit = (data >> i) & 1;
            send(bit);
        }

        // stop signal (low)
        send(0);
    }
}

DeRs232or::DeRs232or() {
    reset();
}

void DeRs232or::reset() {
    waitingForStart = true;
    idleCount = 0;
    inProgressChar = 0;
}

void DeRs232or::receive(bool b) {
    if(waitingForStart) {
        if(b == 1) {
            waitingForStart = false;
            nthBit = 0;
        } else {
            idleCount++;
            send(-1); // -1 means idle
        }
        return;
    }

    if(nthBit == 8) {
        // We've filled up inProgressChar. We expect this next bit to be a
        // stop signal (low). If it isn't, we drop it.
        if(b == 0) {
            send(inProgressChar);
        } else {
            LOG1("Throwing away incomplete character %d", inProgressChar);
        }
        waitingForStart = true;
        idleCount = 0;
        inProgressChar = 0;
    }

    inProgressChar |= (b << nthBit);
    nthBit++;
}

}
