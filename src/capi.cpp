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

struct FskubeState {
    Demodulator demodulator;
    Rs232Interpreter rs232Interpreter;
    StackmatInterpreter stackmatInterpreter;
    StackmatStateReceiver stackmatStateReceiver;
};

void* fskube_initialize(unsigned int sampleRate) {
    FskubeState *fskube = new FskubeState();
    FskParams fsk;
    fsk.samplesPerSecond = sampleRate;
    fsk.bitsPerSecond = 1200;
    fsk.markFrequency = 1200;
    fsk.spaceFrequency = 2200;
    fskube->demodulator.setFskParams(fsk);

    fskube->demodulator.connect(&fskube->rs232Interpreter);
    fskube->rs232Interpreter.connect(&fskube->stackmatInterpreter);
    fskube->stackmatInterpreter.connect(&fskube->stackmatStateReceiver);

    return fskube;
}

void fskube_destroy(void *fskube_) {
    FskubeState *fskube = static_cast<FskubeState*>(fskube_);
    delete fskube;
}

bool fskube_addSample(void *fskube_, double sample) {
    FskubeState *fskube = static_cast<FskubeState*>(fskube_);

    fskube->stackmatStateReceiver.receivedSomething = false;
    fskube->demodulator.receive(sample);
    return fskube->stackmatStateReceiver.receivedSomething;
}

StackmatState fskube_getState(void *fskube_) {
    FskubeState *fskube = static_cast<FskubeState*>(fskube_);

    assert(fskube->stackmatStateReceiver.receivedSomething);
    fskube->stackmatStateReceiver.receivedSomething = false;
    return fskube->stackmatStateReceiver.state;
}
