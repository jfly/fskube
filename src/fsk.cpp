#include <math.h>
#include <cmath>
#include "fsk.h"
#include "logging.h"

namespace fskube {

LOG_HANDLE("fsk")

Modulator::Modulator(FskParams fsk) : fsk(fsk) {
    reset();
}

void Modulator::reset() {
    continuousPhaseOffset = 0;
}

void Modulator::receive(bool bit) {
    unsigned int frequency = bit ? fsk.markFrequency : fsk.spaceFrequency;
    for(unsigned int i = 0; i < fsk.samplesPerBit(); i++) {
        double time = (double) i / fsk.samplesPerSecond;
        double x = time * 2 * M_PI * frequency + continuousPhaseOffset;
        double sample = sin(x);
        send(sample);
    }
    double nextTime = (double) fsk.samplesPerBit() / fsk.samplesPerSecond;
    continuousPhaseOffset = nextTime * 2*M_PI * frequency + continuousPhaseOffset;
    if(continuousPhaseOffset > 2*M_PI) {
        continuousPhaseOffset -= 2*M_PI;
    }
}


Demodulator::Demodulator(FskParams fsk) : fsk(fsk) {
    reset();
}

void Demodulator::reset() {
    sampleIndex = 0;
    lastZeroCrossing = {};
    insignificantSampleCount = 0;
    lastSignificantSample = {};

    lastFrequencyHalfSeen = 0;
    lastFrequencyHalfSeenCount = 0;
}

void Demodulator::flush() {
    LOG2("flush() lastFrequencyHalfSeenCount %d lastFrequencyHalfSeen %d", lastFrequencyHalfSeenCount, lastFrequencyHalfSeen);
    if(lastFrequencyHalfSeen > 0) {
        send(fsk.frequencyToBit(lastFrequencyHalfSeen));
    }
    reset();
}

// http://stackoverflow.com/a/4609795
template <typename T> int sgn(T val) {
    return (T(0) < val) - (val < T(0));
}

void Demodulator::receive(double value) {
    sampleIndex++;
    LOG4("Demodulator::receive(%f) sampleIndex: %llu", value, sampleIndex);

    Sample sample;
    sample.index = sampleIndex;
    sample.value = value;
    sample.valid = true;

    bool isHigh = value >= highThreshold;
    bool isLow = value <= lowThreshold;
    if(!isHigh && !isLow) {
        insignificantSampleCount++;
        if(insignificantSampleCount > fsk.samplesPerBit()) {
            // We've seen a bunch of insignificant signals in a row.
            // There's probably no signal. Flush what we have.
            flush();
        }
        // Quick bootstrapping. If we haven't seen any "significant"
        // signals yet, and this one is close to zero (ie:
        // "insignificant"), treat it as a zero. Note that we don't
        // call _addZeroCrossing() here, as we may have a bunch
        // of zeros in a row, and we don't want them to be treated as
        // half periods of our signal.
        if(!lastSignificantSample.valid) {
            lastZeroCrossing = sample;
        }
        return;
    }
    LOG4("receive() %f %d %f", value, lastSignificantSample.valid, lastSignificantSample.value);
    insignificantSampleCount = 0;
    if(lastSignificantSample.valid) {
        unsigned long long index = sampleIndex;
        unsigned long long lastIndex = lastSignificantSample.index;
        double lastValue = lastSignificantSample.value;
        if(sgn(lastValue) != sgn(value)) {
            // We've got 2 points that are on opposite sides of the x axis:
            //    point1 = (lastIndex, lastValue)
            //    point2 = (index, value)
            // Imagine a straight line connecting them. We'd like to know
            // where that line crosses the x axis. Lets call that crossing
            // point (C, 0). The slope from point1 to (C, 0) should be the same
            // as the slope from (C, 0) to point2:
            //   (0 - lastValue) / (C - lastIndex) = (value - 0) / (index - C)
            //   -lastValue * (index - C) = value * (C - lastIndex)
            //   -lastValue*index + lastValue*C = value*C - value*lastIndex
            //   -lastValue*index + value*lastIndex = value*C - C*lastValue
            //   C = (value*lastIndex - lastValue*index) / (value - lastValue)
            unsigned long long crossingIndex =
                (value*lastIndex - lastValue*index) / (value - lastValue);
            Sample crossingSample;
            crossingSample.index = crossingIndex;
            crossingSample.value = 0;
            crossingSample.valid = true;
            // We crossed the x axis in a "significant" way!
            addZeroCrossing(crossingSample);
        }
    }
    lastSignificantSample = sample;
}

#define ABS(a) ((a) >= 0 ? (a) : -(a))

/**
 * Given the index at which a zero crossing occurred, determine
 * the current frequency of the signal.
 * If the frequency is nonsensical, reset everything.
 * If the frequency is near the mark or space frequency, 
 * call either addMarkFrequencySeen() or addSpaceFrequencySeen().
 */
void Demodulator::addZeroCrossing(Sample sample) {
    LOG1("Zero crossing! @%llu (last one was at %llu isValid: %d)",
            sample.index, lastZeroCrossing.index, lastZeroCrossing.valid);
    if(lastZeroCrossing.valid) {
        double crossingTimeDelta = fsk.samplesToTime(sample.index - lastZeroCrossing.index);
        // 1/2th the hZ of a signal is its expected amount of time
        // between zero crossings.
        double markCrossingTime = 0.5/fsk.markFrequency;
        double spaceCrossingTime = 0.5/fsk.spaceFrequency;
        double markRatio = crossingTimeDelta / markCrossingTime;
        double spaceRatio = crossingTimeDelta / spaceCrossingTime;
        double distanceToMark = ABS(markRatio - 1);
        double distanceToSpace = ABS(spaceRatio - 1);
        LOG1("Zero crossing of duration %f seconds", crossingTimeDelta);
        LOG1("distanceToMark: %f distanceToSpace: %f",
                distanceToMark, distanceToSpace);
        if(distanceToMark < distanceToSpace) {
            addFrequencyHalfSeen(fsk.markFrequency);
        } else {
            addFrequencyHalfSeen(fsk.spaceFrequency);
        }
    }
    lastZeroCrossing = sample;
    LOG1("Zero crossing is now %llu isValid: %d)",
            lastZeroCrossing.index, lastZeroCrossing.valid);
}

void Demodulator::addFrequencyHalfSeen(unsigned int frequency) {
    if(lastFrequencyHalfSeen == 0) {
        lastFrequencyHalfSeen = frequency;
        lastFrequencyHalfSeenCount = 0;
    }
    LOG2("Frequency seen! %uhZ (had seen %uhZ %u times)",
            frequency, lastFrequencyHalfSeen, lastFrequencyHalfSeenCount);
    double periodsPerSecond = lastFrequencyHalfSeen;
    double periodsPerBit = fsk.secondsPerBit() * periodsPerSecond;
    unsigned int halfPeriodsPerBit = rint(2 * periodsPerBit);
    if(frequency == lastFrequencyHalfSeen) {
        lastFrequencyHalfSeenCount++;
        if(lastFrequencyHalfSeenCount >= halfPeriodsPerBit) {
            bool bit = fsk.frequencyToBit(lastFrequencyHalfSeen);
            send(bit);
            lastFrequencyHalfSeenCount = 0;
        }
    } else {
        // We've witnessed a change in frequency!
        if(lastFrequencyHalfSeenCount >= 1) {
            // We've seen some occurences of the previous frequency (but
            // we hadn't seen enough to fire a bit). Dump the bit, but
            // reset lastFrequencyHalfSeenCount. The intuition here is that
            // the frequency we just saw was straddled between 2 bits,
            // and we don't want to count it towards our next bit.
            bool bit = fsk.frequencyToBit(lastFrequencyHalfSeen);
            send(bit);
            lastFrequencyHalfSeen = frequency;
            lastFrequencyHalfSeenCount = 0;
        } else {
            lastFrequencyHalfSeen = frequency;
            lastFrequencyHalfSeenCount = 1;
        }
    }
}

} // namespace fskube
