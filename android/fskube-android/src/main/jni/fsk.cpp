#include <assert.h>
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

Demodulator::Demodulator() {
    sampleIndex = 0;
}

Demodulator::Demodulator(FskParams fsk) {
    sampleIndex = 0;
    setFskParams(fsk);
    reset();
}

void Demodulator::setFskParams(FskParams fsk) {
    assert(fsk.markFrequency < fsk.spaceFrequency);
    this->fsk = fsk;
}

void Demodulator::reset() {
    // We don't reset sampleIndex because it's easier to debug tests when the index
    // is monotonically increasing. It'll take a very long time for an unsigned
    // long long to wrap =).
    // sampleIndex = 0;
    lastZeroCrossing = {};
    insignificantSampleCount = 0;
    lastSignificantSample = {};

    lastFrequencyHalfSeen = 0;
    lastFrequencyHalfSeenCount = 0;

    nearMarks = 0;
    currentMarkStreak = 0;
}

void Demodulator::flush() {
    LOG2("flush() lastFrequencyHalfSeenCount %d lastFrequencyHalfSeen %d", lastFrequencyHalfSeenCount, lastFrequencyHalfSeen);
    if(lastFrequencyHalfSeenCount >= 1) {
        bool bit = fsk.frequencyToBit(lastFrequencyHalfSeen);
        LOG2("sending bit %d", bit);
        send(bit);
    }
    reset();
}

// http://stackoverflow.com/a/4609795
template <typename T> int sgn(T val) {
    return (T(0) < val) - (val < T(0));
}

void Demodulator::receive(double value) {
    assert(value <= 1.0);
    assert(value >= -1.0);
    LOG4("Demodulator::receive(%f) sampleIndex: %llu", value, sampleIndex);

    Sample sample;
    sample.index = sampleIndex++;
    sample.remainder = 0;
    sample.value = value;
    sample.valid = true;

    bool isHigh = value >= FSK_HIGH_THRESHOLD;
    bool isLow = value <= FSK_LOW_THRESHOLD;
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
        // call addZeroCrossing() here, as we may have a bunch
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
        unsigned long long index = sample.index;
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

            // TODO - this should be changed to do integer math for speed and accuracy
            // Even at 48kHz sampling, it should take hundreds of years before
            // we start to lose precision with a double.
            // TODO - store samples as ints in some range rather than doubles
            double crossingIndex =
                (value*lastIndex - lastValue*index) / (value - lastValue);
            Sample crossingSample;
            crossingSample.index = crossingIndex;
            crossingSample.remainder = (crossingIndex - (int) crossingIndex);
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
 * the current frequency of the signal. If the frequency is clear,
 * call addFrequencyHalfSeen(), if it's unclear, then do some special
 * stuff to make it more likely to see marks (the signal with a lower frequency).
 */
void Demodulator::addZeroCrossing(Sample sample) {
    LOG1("Zero crossing! @%llu+%f (last one was at %llu+%f isValid: %d)",
            sample.index, sample.remainder, lastZeroCrossing.index, lastZeroCrossing.remainder, lastZeroCrossing.valid);
    if(lastZeroCrossing.valid) {
        double samples = (sample.index - lastZeroCrossing.index) + (sample.remainder - lastZeroCrossing.remainder);
        double crossingTimeDelta = fsk.samplesToTime(samples);
        // 1/2th the hZ of a signal is its expected amount of time
        // between zero crossings.
        double markCrossingTime = 0.5/fsk.markFrequency;
        double spaceCrossingTime = 0.5/fsk.spaceFrequency;
        double markRatio = crossingTimeDelta / markCrossingTime;
        double spaceRatio = crossingTimeDelta / spaceCrossingTime;
        double distanceToMark = ABS(markRatio - 1);
        double distanceToSpace = ABS(spaceRatio - 1);
        LOG1("Zero crossing of %f seconds (distanceToMark: %f distanceToSpace: %f)",
                crossingTimeDelta, distanceToMark, distanceToSpace);

        // If the measured frequency is within 10% of the target mark or space
        // frequency, call addFrequencyHalfSeen(). If not, keep track of
        // frequencies within 20% of the mark (this are called nearMarks).
        // If we witness a nearMark without ever seeing a "perfect"
        // (within 10%) mark (currentMarkStreak == 0), then we send out a mark.
        // Also, if we witness 2 nearMarks, fire a mark. Unfortunately, this
        // logic is pretty hardcoded for markFrequency=1200Hz and
        // spaceFrequency=2200Hz.
        float MAX_PERFECT_DISTANCE = 0.10;
        float MAX_NEAR_DISTANCE = 0.20;
        if(distanceToMark <= MAX_PERFECT_DISTANCE) {
            currentMarkStreak++;
            addFrequencyHalfSeen(fsk.markFrequency);
        } else if(distanceToSpace <= MAX_PERFECT_DISTANCE) {
            if(currentMarkStreak == 0 && nearMarks >= 1) {
                bool bit = fsk.frequencyToBit(fsk.markFrequency);
                LOG2("sending bit %d", bit);
                send(bit);
                nearMarks = 0;
            }
            currentMarkStreak = 0;
            nearMarks = 0;
            addFrequencyHalfSeen(fsk.spaceFrequency);
        } else {
            LOG1("Ignoring zero crossing");
            if(lastFrequencyHalfSeenCount >= 1) {
                // We've seen some occurences of the previous frequency (but
                // we hadn't seen enough to fire a bit). Dump the bit.
                bool bit = fsk.frequencyToBit(lastFrequencyHalfSeen);
                LOG2("sending bit %d", bit);
                send(bit);
            } else {
                if(distanceToMark <= MAX_NEAR_DISTANCE) {
                    nearMarks++;
                    if(nearMarks == 2) {
                        bool bit = fsk.frequencyToBit(fsk.markFrequency);
                        LOG2("sending bit %d", bit);
                        send(bit);
                        nearMarks = 0;
                    }
                }
            }
            lastFrequencyHalfSeen = 0;
            lastFrequencyHalfSeenCount = 0;
        }
    }
    lastZeroCrossing = sample;
    LOG1("Zero crossing is now %llu+%f isValid: %d",
         lastZeroCrossing.index, lastZeroCrossing.remainder, lastZeroCrossing.valid);
}

void Demodulator::addFrequencyHalfSeen(unsigned int frequency) {
    if(lastFrequencyHalfSeen == 0) {
        lastFrequencyHalfSeen = frequency;
        lastFrequencyHalfSeenCount = 0;
    }
    LOG2("Frequency seen! %uhZ (had seen %uhZ %u times)",
            frequency, lastFrequencyHalfSeen, lastFrequencyHalfSeenCount);
    if(frequency == lastFrequencyHalfSeen) {
        lastFrequencyHalfSeenCount++;

        double periodsPerSecond = lastFrequencyHalfSeen;
        double periodsPerBit = fsk.secondsPerBit() * periodsPerSecond;
        unsigned int halfPeriodsPerBit = rint(2 * periodsPerBit);
        if(lastFrequencyHalfSeenCount >= halfPeriodsPerBit) {
            bool bit = fsk.frequencyToBit(lastFrequencyHalfSeen);
            LOG2("sending bit %d", bit);
            send(bit);
            lastFrequencyHalfSeenCount = 0;
        }
    } else {
        // We've witnessed a change in frequency!
        if(lastFrequencyHalfSeenCount >= 1) {
            // We've seen some occurences of the previous frequency (but
            // we hadn't seen enough to fire a bit). Flush the bit.
            bool bit = fsk.frequencyToBit(lastFrequencyHalfSeen);
            LOG2("sending bit %d", bit);
            send(bit);
        }
        lastFrequencyHalfSeen = frequency;
        lastFrequencyHalfSeenCount = 1;
    }
}

} // namespace fskube
