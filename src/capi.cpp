#include <assert.h>
#include <stdlib.h>

#include "fsk.h"
#include "rs232.h"
#include "stackmat.h"
#include "capi.h"
#include "logging.h"

LOG_HANDLE("capi")

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
static unsigned int samplesWithoutData = 0;
static unsigned int samplesUntilOff;

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

    // Half a second without data is long enough to declare the timer "off"
    samplesUntilOff = sampleRate / 2;
    initialized = true;
}

bool fskube_addSample(double sample) {
    assert(initialized);
    stackmatStateReceiver.receivedSomething = false;
    demodulator.receive(sample);
    if(stackmatStateReceiver.receivedSomething) {
        samplesWithoutData = 0;
        return true;
    } else {
        samplesWithoutData++;
        // Only notify once about going idle, rather than repeatedly.
        if(samplesWithoutData == samplesUntilOff) {
            LOG1("seen %d samples without data, assuming stackmat is off or unlugged", samplesUntilOff);
            stackmatStateReceiver.state = StackmatState();
            return true;
        }
        return false;
    }
}

StackmatState fskube_getState() {
    assert(initialized);
    return stackmatStateReceiver.state;
}
