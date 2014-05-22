#include <assert.h>
#include <math.h>
#include <cmath>
#include "fskube.h"
#include "logging.h"

namespace fskube {

LOG_HANDLE("fskube")

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
        double distanceToMark = std::abs(markRatio - 1);
        double distanceToSpace = std::abs(spaceRatio - 1);
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


StackmatSynthesizer::StackmatSynthesizer() {}

#define MILLIS_PER_MINUTE (60*1000)
#define MILLIS_PER_SECOND (1000)
#define MILLIS_PER_DECISECOND (100)
#define MILLIS_PER_CENTISECOND (10)

void StackmatSynthesizer::receive(StackmatState state) {
    send(state.commandByte);

    int checksum = 64;
    int millis = state.millis;

    // minutes
    int minutes_digit = millis / MILLIS_PER_MINUTE;
    millis %= MILLIS_PER_MINUTE;
    checksum += minutes_digit;
    send('0' + minutes_digit);
    
    // seconds
    int seconds = millis / MILLIS_PER_SECOND;
    millis %= MILLIS_PER_SECOND;

    int dekaseconds_digit = seconds / 10;
    checksum += dekaseconds_digit;
    send('0' + dekaseconds_digit);

    int seconds_digit = seconds % 10;
    checksum += seconds_digit;
    send('0' + seconds_digit);

    // decimal
    int deciseconds_digit = millis / MILLIS_PER_DECISECOND;
    millis = millis % MILLIS_PER_DECISECOND;
    checksum += deciseconds_digit;
    send('0' + deciseconds_digit);

    int centiseconds_digit = millis / MILLIS_PER_CENTISECOND;
    millis = millis % MILLIS_PER_CENTISECOND;
    checksum += centiseconds_digit;
    send('0' + centiseconds_digit);

    if(state.generation == 3) {
        int milliseconds_digit = millis;
        checksum += milliseconds_digit;
        send('0' + milliseconds_digit);
    }

    // checksum
    send(checksum);

    // LF
    send('\n');

    // CR
    send('\r');

    // idle
    send(-1);
}

StackmatInterpreter::StackmatInterpreter() {
    reset();
}

void StackmatInterpreter::reset() {
    receivedBytesLength = 0;
}

void StackmatInterpreter::receive(int byte) {
    LOG2("StackmatInterpreter::receive(%d)", byte);
    if(byte < 0) {
        // idle received, parse collected characters
        switch(receivedBytesLength) {
            case GEN2SIGNAL_BYTES:
            case GEN3SIGNAL_BYTES: {
                StackmatState state;
                if(receivedBytesLength == GEN2SIGNAL_BYTES) {
                    state.generation = 2;
                } else if(receivedBytesLength == GEN3SIGNAL_BYTES) {
                    state.generation = 3;
                } else {
                    assert(false);
                }
                state.commandByte = receivedBytes[0];

                state.millis = 0;
                state.millis += (receivedBytes[1] - '0') * MILLIS_PER_MINUTE;

                int seconds = 10 * (receivedBytes[2] - '0') + (receivedBytes[3] - '0');
                state.millis += seconds * MILLIS_PER_SECOND;
                state.millis += (receivedBytes[4] - '0') * MILLIS_PER_DECISECOND;
                state.millis += (receivedBytes[5] - '0') * MILLIS_PER_CENTISECOND;
                if(state.generation == 3) {
                    state.millis += (receivedBytes[6] - '0');
                }

                send(state);
                receivedBytesLength = 0;
                break;
            }
            default:
                LOG1("Throwing away partial signal of %d bytes" , receivedBytesLength);
                break;
        }
        return;
    }

    if(receivedBytesLength >= LARGESTSIGNAL_BYTES) {
        // Uh oh. We've received more bytes than can possibly comprise
        // a stackmat signal. We should have seen an idle by now.
        // We have nothing better to do than to throw away what we've seen so far.
        LOG1("Throwing away run on signal");
        reset();
        return;
    }

    receivedBytes[receivedBytesLength++] = byte;
}

} // namespace fskube
