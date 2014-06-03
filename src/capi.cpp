#include <assert.h>
#include <stdlib.h>

#include "fsk.h"
#include "rs232.h"
#include "stackmat.h"
#include "capi.h"

using namespace fskube;

class StackmatStateReceiver : public Receiver<StackmatState> {

    public:
        bool receivedSomething = false;
        StackmatState state;

        void receive(StackmatState state) {
            receivedSomething = true;
            this->state = state;
        }

};

static Demodulator demodulator;
static Rs232Interpreter rs232Interpreter;
static StackmatInterpreter stackmatInterpreter;
static StackmatStateReceiver stackmatStateReceiver;
static bool initialized = false;

void fskube_initialize(unsigned int sampleRate) {
    FskParams fsk;
    fsk.samplesPerSecond = sampleRate;
    fsk.bitsPerSecond = 1200;
    fsk.markFrequency = 1200;
    fsk.spaceFrequency = 2200;
    demodulator.setFskParams(fsk);

    demodulator.connect(&rs232Interpreter);
    rs232Interpreter.connect(&stackmatInterpreter);
    stackmatInterpreter.connect(&stackmatStateReceiver);

    initialized = true;
}

bool fskube_addSample(double sample) {
    assert(initialized);
    stackmatStateReceiver.receivedSomething = false;
    demodulator.receive(sample);
    return stackmatStateReceiver.receivedSomething;
}

StackmatState fskube_getState() {
    assert(initialized);
    return stackmatStateReceiver.state;
}
