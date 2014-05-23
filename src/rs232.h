#ifndef RS232_H
#define RS232_H

#include "receiversender.h"

namespace fskube {

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

} // namespace fskube

#endif // RS232_H
