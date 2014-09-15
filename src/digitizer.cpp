#include "logging.h"
#include "digitizer.h"

namespace fskube {

LOG_HANDLE("digitizer")

void DigitizerBase::setSamplesPerSecond(unsigned int samplesPerSecond) {
    this->samplesPerSecond = samplesPerSecond;
}

void DigitizerBase::setBitsPerSecond(unsigned int bitsPerSecond) {
    this->bitsPerSecond = bitsPerSecond;
}

Digitizer::Digitizer() {
}

Digitizer::Digitizer(unsigned int samplesPerSecond, unsigned int bitsPerSecond) {
    setSamplesPerSecond(samplesPerSecond);
    setBitsPerSecond(bitsPerSecond);
    reset();
}

void Digitizer::maybeSendCurrentBit() {
    // Only fire a bit if we've seen a significant (ie: >= 1/2) of a bit.
    if(samplesSeen >= samplesPerBit() / 2) {
        LOG2("after %d samples, sending %d", samplesSeen, currentBit);
        send(currentBit);
    }
    samplesSeen = 0;
}

void Digitizer::receive(double sample) {
    LOG4("sample: %f currentBit: %d", sample, currentBit);
    if(currentBit == 0 && sample >= DIGITIZER_HIGH_WATER_MARK) {
        maybeSendCurrentBit();
        currentBit = 1;
    } else if(currentBit == 1 && sample <= DIGITIZER_LOW_WATER_MARK) {
        maybeSendCurrentBit();
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

Analogizer::Analogizer() {
}

Analogizer::Analogizer(unsigned int samplesPerSecond, unsigned int bitsPerSecond) {
    setSamplesPerSecond(samplesPerSecond);
    setBitsPerSecond(bitsPerSecond);
    reset();
}

void Analogizer::receive(bool bit) {
    LOG4("bit: %d", bit);
    for(int i = 0; i < samplesPerBit(); ++i) {
        send(bit ? 1 : -1);
    }
}

void Analogizer::reset() {
}

} // namespace fskube
