#ifndef DIGITIZER_H
#define DIGITIZER_H

#include "receiversender.h"

namespace fskube {

#define DIGITIZER_HIGH_WATER_MARK (0.6)
#define DIGITIZER_LOW_WATER_MARK (-0.6)

class Digitizer : public Sender<double, bool> {
    private:
        unsigned int samplesPerSecond;
        unsigned int bitsPerSecond;

        bool currentBit;
        unsigned int samplesSeen;

        inline int samplesPerBit() {
            return samplesPerSecond / bitsPerSecond;
        }
        void maybeSendCurrentBit();
    public:
        Digitizer();
        Digitizer(unsigned int samplesPerSecond, unsigned int bitsPerSecond);
        void setSamplesPerSecond(unsigned int samplesPerSecond);
        void setBitsPerSecond(unsigned int bitsPerSecond);
        virtual void receive(double sample);
        virtual void reset();
};

} // namespace fskube

#endif // DIGITIZER_H
