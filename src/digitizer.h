#ifndef DIGITIZER_H
#define DIGITIZER_H

#include "receiversender.h"

namespace fskube {

#define DIGITIZER_HIGH_WATER_MARK (0.6)
#define DIGITIZER_LOW_WATER_MARK (-0.6)

class DigitizerBase {
    protected:
        unsigned int samplesPerSecond;
        unsigned int bitsPerSecond;

        inline int samplesPerBit() {
            return samplesPerSecond / bitsPerSecond;
        }
    public:
        void setSamplesPerSecond(unsigned int samplesPerSecond);
        void setBitsPerSecond(unsigned int bitsPerSecond);
};

class Digitizer : public Sender<double, bool>, public DigitizerBase {
    private:
        bool currentBit;
        unsigned int samplesSeen;
        void maybeSendCurrentBit();
    public:
        Digitizer();
        Digitizer(unsigned int samplesPerSecond, unsigned int bitsPerSecond);
        virtual void receive(double sample);
        virtual void reset();
};

// The inverse of a Digitizer
class Analogizer : public Sender<bool, double>, public DigitizerBase {
    public:
        Analogizer();
        Analogizer(unsigned int samplesPerSecond, unsigned int bitsPerSecond);
        virtual void receive(bool bit);
        virtual void reset();
};

} // namespace fskube

#endif // DIGITIZER_H
