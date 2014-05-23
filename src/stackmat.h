#ifndef STACKMAT_H
#define STACKMAT_H

#include "receiversender.h"

namespace fskube {

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

#endif // STACKMAT_H
