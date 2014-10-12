#include <assert.h>
#include "stackmat.h"
#include "logging.h"

namespace fskube {

LOG_HANDLE("stackmat")

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
                int i = 0;
                state.commandByte = receivedBytes[i++];

                int minuteDigit = (receivedBytes[i++] - '0');
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
                state.millis += minuteDigit * MILLIS_PER_MINUTE;
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
