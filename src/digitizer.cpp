#include "logging.h"
#include "digitizer.h"

namespace fskube {

LOG_HANDLE("digitizer")

Digitizer::Digitizer() {
}

Digitizer::Digitizer(unsigned int samplesPerSecond, unsigned int bitsPerSecond) {
    setSamplesPerSecond(samplesPerSecond);
    setBitsPerSecond(bitsPerSecond);
    reset();
}

void Digitizer::setSamplesPerSecond(unsigned int samplesPerSecond) {
    this->samplesPerSecond = samplesPerSecond;
}

void Digitizer::setBitsPerSecond(unsigned int bitsPerSecond) {
    this->bitsPerSecond = bitsPerSecond;
}

void Digitizer::maybeSendCurrentBit() {
    // TODO - <<< comment
    if(samplesSeen >= samplesPerBit() / 2) {
        LOG2("after %d samples, sending %d", samplesSeen, currentBit);
        send(currentBit);
    }
    samplesSeen = 0;
}

void Digitizer::receive(double sample) {
    LOG4("receive(%f)", sample);
    if(currentBit == 0 && sample >= DIGITIZER_HIGH_WATER_MARK) {
        maybeSendCurrentBit();
        currentBit = 1;
    } else if(currentBit == 1 && sample <= DIGITIZER_LOW_WATER_MARK) {
        maybeSendCurrentBit();
        currentBit = 0;
    } else {
        samplesSeen++;
        if(samplesSeen >= samplesPerBit()) {
            maybeSendCurrentBit();
        }
    }
}

void Digitizer::reset() {
    samplesSeen = 0;
    currentBit = 0;
}

} // namespace fskube
