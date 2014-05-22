#ifndef FSKUBE_H
#define FSKUBE_H

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
    double value;
    bool valid;
};

class Demodulator : public Sender<double, bool> {
    private:
        FskParams fsk;
        // Histeresis to avoid issues if the signal wavers around zero.
        // See nexus5helloworld for an example of some noise around zero at the
        // start of transmission.
        double highThreshold = 0.4;
        double lowThreshold = -0.4;

        unsigned long long sampleIndex;
        Sample lastZeroCrossing;
        unsigned int insignificantSampleCount;
        Sample lastSignificantSample;

        unsigned int lastFrequencyHalfSeen;
        unsigned int lastFrequencyHalfSeenCount;

        void reset();
        void addZeroCrossing(Sample sample);
        void addFrequencyHalfSeen(unsigned int frequency);
    public:
        Demodulator(FskParams fsk);
        virtual void receive(double value);
        void flush();
};

// Convert bytes <-> bits via 8-N-1
// See http://en.wikipedia.org/wiki/8-N-1

class Rs232or : public Sender<int, bool> {
    public:
        Rs232or();
        virtual void receive(int data);
};

class DeRs232or : public Sender<bool, int> {
    private:
        bool waitingForStart;
        unsigned int idleCount;

        unsigned char inProgressChar;
        unsigned int nthBit;
    public:
        DeRs232or();
        virtual void receive(bool b);
        void reset();
};

// Convert bytes <-> StackmatState's according to the stackmat protocol
// See http://hackvalue.de/hv_atmel_stackmat

#define GEN2SIGNAL_BYTES 9
#define GEN3SIGNAL_BYTES 10
#define LARGESTSIGNAL_BYTES GEN3SIGNAL_BYTES

struct StackmatState {
    unsigned int millis;
    unsigned int generation;
    unsigned char commandByte;
    bool operator==(StackmatState& o) const {
        return millis == o.millis && generation == o.generation && commandByte == o.commandByte;
    }
};

class StackmatSynthesizer : public Sender<StackmatState, int> {
    public:
        StackmatSynthesizer();
        virtual void receive(StackmatState s);
};

class StackmatInterpreter : public Sender<int, StackmatState> {
    private:
        int receivedBytes[LARGESTSIGNAL_BYTES];
        int receivedBytesLength;
    public:
        StackmatInterpreter();
        void reset();
        virtual void receive(int byte);
};

} // namespace fskube

#endif // FSKUBE_H
