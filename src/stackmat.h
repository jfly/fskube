#ifndef STACKMAT_H
#define STACKMAT_H

#include "receiversender.h"

namespace fskube {

// Convert bytes <-> StackmatState's according to the stackmat protocol
// See http://hackvalue.de/hv_atmel_stackmat

#define GEN2SIGNAL_BYTES 9
#define GEN3SIGNAL_BYTES 10
#define LARGESTSIGNAL_BYTES GEN3SIGNAL_BYTES

#define MILLIS_PER_MINUTE (60*1000)
#define MILLIS_PER_TENSECONDS (10000)
#define MILLIS_PER_SECOND (1000)
#define MILLIS_PER_DECISECOND (100)
#define MILLIS_PER_CENTISECOND (10)

struct StackmatState {
    bool on;
    unsigned char checksum;
    unsigned char lf;
    unsigned char cr;
    unsigned int millis;
    unsigned int generation;
    unsigned char commandByte;

    unsigned int minutesDigit() {
        return ( millis / MILLIS_PER_MINUTE ) % 10;
    }
    unsigned int tensSecondsDigit() {
        return ( ( millis % MILLIS_PER_MINUTE ) / MILLIS_PER_TENSECONDS ) % 10;
    }
    unsigned int onesSecondsDigit() {
        return ( millis / MILLIS_PER_SECOND ) % 10;
    }
    unsigned int tenthsDigit() {
        return ( millis / MILLIS_PER_DECISECOND ) % 10;
    }
    unsigned int hundredthsDigit() {
        return ( millis / MILLIS_PER_CENTISECOND  ) % 10;
    }
    unsigned int thousandthsDigit() {
        return millis % 10;
    }
    unsigned char computedChecksum() {
        return 64 + minutesDigit() + tensSecondsDigit() +
            onesSecondsDigit() + tenthsDigit() + hundredthsDigit() +
            thousandthsDigit();
    }
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

#endif // STACKMAT_H
