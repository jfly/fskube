#ifndef FSK_H
#define FSK_H

#include "receiversender.h"

namespace fskube {

struct FskParams {
    unsigned int samplesPerSecond;
    unsigned int bitsPerSecond;
    unsigned int markFrequency;
    unsigned int spaceFrequency;
    // Note that this will probably involve truncation, which means
    // that we'll slowly drift. This is fine, as real hardware will
    // drift as well, and we need to be able to deal with that.
    unsigned int samplesPerBit() {
        return samplesPerSecond / bitsPerSecond;
    }
    double secondsPerBit() {
        return 1.0 / bitsPerSecond;
    }
    double samplesToTime(unsigned int samples) {
        return (double) samples / samplesPerSecond;
    }
    double samplesToTime(double samples) {
        return samples / samplesPerSecond;
    }
    bool frequencyToBit(unsigned int frequency) {
        return frequency == markFrequency ? 1 : 0;
    }
};

class Modulator : public Sender<bool, double> {
    private:
        FskParams fsk;
        double continuousPhaseOffset;
    public:
        Modulator(FskParams fsk);
        virtual void receive(bool bit);
        virtual void reset();
};

struct Sample {
    unsigned long long index;
    float remainder;
    double value;
    bool valid;
};

// Histeresis to avoid issues if the signal wavers around zero.
// See nexus5helloworld for an example of some noise around zero at the
// start of transmission.
#define FSK_HIGH_THRESHOLD 0.4
#define FSK_LOW_THRESHOLD -0.4

class Demodulator : public Sender<double, bool> {
    private:
        FskParams fsk;

        unsigned long long sampleIndex;
        Sample lastZeroCrossing;
        unsigned int insignificantSampleCount;
        Sample lastSignificantSample;

        unsigned int lastFrequencyHalfSeen;
        unsigned int lastFrequencyHalfSeenCount;

        void reset();
        void addZeroCrossing(Sample sample);
        void addFrequencyHalfSeen(unsigned int frequency);
        int nearMarks;
        int currentMarkStreak;
    public:
        Demodulator();
        Demodulator(FskParams fsk);
        void setFskParams(FskParams fsk);
        virtual void receive(double value);
        void flush();
};

} // namespace fskube

#endif // FSK_H
