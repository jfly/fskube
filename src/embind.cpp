#include <emscripten/bind.h>
#include "fskube.h"

using namespace emscripten;

namespace fskube {

struct boolReceiverWrapper : public wrapper<Receiver<bool>> {
    EMSCRIPTEN_WRAPPER(boolReceiverWrapper);
    void receive(bool b) {
        return call<void>("receive", b);
    }
};

struct doubleReceiverWrapper : public wrapper<Receiver<double>> {
    EMSCRIPTEN_WRAPPER(doubleReceiverWrapper);
    void receive(double b) {
        return call<void>("receive", b);
    }
};

EMSCRIPTEN_BINDINGS(my_module) {
    value_object<FskParams>("FskParams")
        .field("samplesPerSecond", &FskParams::samplesPerSecond)
        .field("bitsPerSecond", &FskParams::bitsPerSecond)
        .field("markFrequency", &FskParams::markFrequency)
        .field("spaceFrequency", &FskParams::spaceFrequency)
        ;

    // TODO - the documentation https://github.com/kripken/emscripten/wiki/embind
    // is missing the required argument to allow_subclass.
    class_<Receiver<bool>>("boolReceiver")
        .function("receive", &Receiver<bool>::receive)
        .allow_subclass<boolReceiverWrapper>("boolReceiverWrapper")
        ;

    class_<Receiver<double>>("doubleReceiver")
        .function("receive", &Receiver<double>::receive)
        .allow_subclass<doubleReceiverWrapper>("doubleReceiverWrapper")
        ;

    class_<Sender<bool, double>, base<Receiver<bool>>>("boolReceiver_doubleSender")
        .function("connect", &Sender<bool, double>::connect, allow_raw_pointers())
        ;

    class_<Sender<double, bool>, base<Receiver<double>>>("doubleReceiver_boolSender")
        .function("connect", &Sender<double, bool>::connect, allow_raw_pointers())
        ;

    class_<Modulator, base<Sender<bool, double>>>("Modulator")
        .constructor<FskParams>()
        .function("reset", &Modulator::reset)
        ;

    class_<Demodulator, base<Sender<double, bool>>>("Demodulator")
        .constructor<FskParams>()
        .function("flush", &Demodulator::flush)
        ;
}

}
