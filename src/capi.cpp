#include <assert.h>
#include <stdlib.h>
#include <time.h>

#include "fsk.h"
#include "digitizer.h"
#include "rs232.h"
#include "stackmat.h"
#include "capi.h"
#include "logging.h"

LOG_HANDLE("capi")

using namespace fskube;

// Copied from http://www.guyrutenberg.com/2007/09/22/profiling-code-using-clock_gettime/
timespec diff(timespec start, timespec end)
{
    timespec temp;
    if ((end.tv_nsec-start.tv_nsec)<0) {
        temp.tv_sec = end.tv_sec-start.tv_sec-1;
        temp.tv_nsec = 1000000000+end.tv_nsec-start.tv_nsec;
    } else {
        temp.tv_sec = end.tv_sec-start.tv_sec;
        temp.tv_nsec = end.tv_nsec-start.tv_nsec;
    }
    return temp;
}

#define NANOSECS_PER_MILLISEC 1000000
#define MILLISECS_PER_SEC 1000

class StackmatStateReceiver : public Receiver<StackmatState> {

    private:
        StackmatState state;
        timespec timeLastStateWasReceived;

    public:
        bool receivedSomething;
        bool isRunning;

        StackmatStateReceiver() {
            receivedSomething = false;
        }

        void receive(StackmatState state) {
            bool validChecksum = state.checksum == state.computedChecksum();
            LOG2("StackmatStateReceiver::receive() state.millis: %d checksum: %d computedChecksum: %d", state.millis, state.checksum, state.computedChecksum());
            if(!validChecksum) {
                return;
            }
            clock_gettime(CLOCK_MONOTONIC, &timeLastStateWasReceived);
            isRunning = ( state.millis > this->state.millis );
            receivedSomething = true;
            this->state = state;
        }

        StackmatState getState() {
            StackmatState fakeState = state;
            if(isRunning) {
                timespec now;
                clock_gettime(CLOCK_MONOTONIC, &now);
                timespec delta = diff(timeLastStateWasReceived, now);
                fakeState.millis += MILLISECS_PER_SEC * delta.tv_sec;
                fakeState.millis += delta.tv_nsec / NANOSECS_PER_MILLISEC;
            }
            return fakeState;
	}
};

static Demodulator demodulator;
static Rs232Interpreter fskRs232Interpreter;
static StackmatInterpreter fskStackmatInterpreter;

static Digitizer digitizer;
static Rs232Interpreter digitalRs232Interpreter;
static StackmatInterpreter digitalStackmatInterpreter;

static StackmatStateReceiver stackmatStateReceiver;

static bool initialized = false;
static unsigned int samplesWithoutData = 0;
static unsigned int samplesUntilOff;

void fskube_initialize(unsigned int sampleRate) {
    FskParams fsk;
    fsk.samplesPerSecond = sampleRate;

    // The baud rate of a gen2 timer is 1200 Hz, and the baud rate of a gen3 timer
    // is 1220 Hz (even when it sends a gen2 signal). Ideally, we'd have demodulators
    // set up for both baud rates, but gen2 interpretation seems to work fine if we
    // set the baud rate to 1220bps.
    fsk.bitsPerSecond = 1220;

    fsk.markFrequency = 1200;
    fsk.spaceFrequency = 2200;
    demodulator.setFskParams(fsk);

    digitizer.setSamplesPerSecond(sampleRate);
    digitizer.setBitsPerSecond(fsk.bitsPerSecond);

    demodulator.connect(&fskRs232Interpreter);
    fskRs232Interpreter.connect(&fskStackmatInterpreter);
    fskStackmatInterpreter.connect(&stackmatStateReceiver);

    digitizer.connect(&digitalRs232Interpreter);
    digitalRs232Interpreter.connect(&digitalStackmatInterpreter);
    digitalStackmatInterpreter.connect(&stackmatStateReceiver);

    // Half a second without data is long enough to declare the timer "off"
    samplesUntilOff = sampleRate / 2;
    initialized = true;
}

bool fskube_addSample(double sample) {
    assert(initialized);
    stackmatStateReceiver.receivedSomething = false;
    demodulator.receive(sample);
    digitizer.receive(sample);
    if(stackmatStateReceiver.receivedSomething) {
        samplesWithoutData = 0;
        return true;
    } else {
        samplesWithoutData++;
        // Only notify once about going idle, rather than repeatedly.
        if(samplesWithoutData == samplesUntilOff) {
            LOG1("seen %d samples without data, assuming stackmat is off or unlugged", samplesUntilOff);
            stackmatStateReceiver.receive(StackmatState());
            return true;
        }
        return false;
    }
}

StackmatState fskube_getState() {
    assert(initialized);
    return stackmatStateReceiver.getState();
}

bool fskube_isRunning() {
    assert(initialized);
    return stackmatStateReceiver.isRunning;
}
