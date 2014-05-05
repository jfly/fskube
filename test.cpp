#include <stdio.h>
#include "fskube.h"

class Printer : public fskube::Receiver<bool> {
    public:
        virtual void receive(bool sample) {
            printf("Decoded a %d\n", sample);
        }
};

int main() {
    fskube::FskParams fskParams;
    fskParams.samplesPerSecond = 41000;
    fskParams.bitsPerSecond = 1200;
    fskParams.markFrequency = 2200;
    fskParams.spaceFrequency = 1200;

    fskube::Modulator modulator(fskParams);
    fskube::Demodulator demodulator(fskParams);
    Printer p;

    modulator.connect(&demodulator);
    demodulator.connect(&p);

    modulator.receive(1);
    modulator.receive(0);
    modulator.receive(1);
    demodulator.flush();
    //<<<
}
