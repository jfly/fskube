#include <assert.h>
#include "stackmat.h"
#include "logging.h"

namespace fskube {

LOG_HANDLE("stackmat")

StackmatSynthesizer::StackmatSynthesizer() {}

void StackmatSynthesizer::receive(StackmatState state) {
    LOG2("state.millis: %d state.checksum: %d", state.millis, state.checksum);
    send(state.commandByte);

    // minutes
    send('0' + state.minutesDigit());
    
    // seconds
    send('0' + state.tensSecondsDigit());
    send('0' + state.onesSecondsDigit());

    // decimal
    send('0' + state.tenthsDigit());

    send('0' + state.hundredthsDigit());

    if(state.generation == 3) {
        send('0' + state.thousandthsDigit());
    }

    // checksum
    send(state.checksum);

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
    LOG2("byte: %d", byte);
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
                int i = 0;
                state.commandByte = receivedBytes[i++];

                int minutesDigit = (receivedBytes[i++] - '0');
                int tensSecondsDigit = (receivedBytes[i++] - '0');
                int onesSecondsDigit = (receivedBytes[i++] - '0');
                int tenthsDigit = (receivedBytes[i++] - '0');
                int hundredthsDigit = (receivedBytes[i++] - '0');
                int thousandthsDigit;
                if(state.generation == 3) {
                    thousandthsDigit = (receivedBytes[i++] - '0');
                } else {
                    thousandthsDigit = 0;
                }
                unsigned char checksum = receivedBytes[i++];
                unsigned char lf = receivedBytes[i++];
                unsigned char cr = receivedBytes[i++];

                state.millis = 0;
                state.millis += minutesDigit * MILLIS_PER_MINUTE;
                int seconds = 10 * tensSecondsDigit + onesSecondsDigit;
                state.millis += seconds * MILLIS_PER_SECOND;
                state.millis += tenthsDigit * MILLIS_PER_DECISECOND;
                state.millis += hundredthsDigit * MILLIS_PER_CENTISECOND;
                state.millis += thousandthsDigit;

                state.checksum = checksum;
                state.lf = lf;
                state.cr = cr;

                receivedBytesLength = 0;
                state.on = true;
                send(state);
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

}
