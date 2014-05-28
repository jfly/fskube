#include <emscripten/bind.h>
#include "fsk.h"
#include "rs232.h"
#include "stackmat.h"
#include "logging.h"

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

struct intReceiverWrapper : public wrapper<Receiver<int>> {
    EMSCRIPTEN_WRAPPER(intReceiverWrapper);
    void receive(int b) {
        return call<void>("receive", b);
    }
};

struct stackmatstateReceiverWrapper : public wrapper<Receiver<StackmatState>> {
    EMSCRIPTEN_WRAPPER(stackmatstateReceiverWrapper);
    void receive(StackmatState s) {
        return call<void>("receive", s);
    }
};

EMSCRIPTEN_BINDINGS(my_module) {
    value_object<FskParams>("FskParams")
        .field("samplesPerSecond", &FskParams::samplesPerSecond)
        .field("bitsPerSecond", &FskParams::bitsPerSecond)
        .field("markFrequency", &FskParams::markFrequency)
        .field("spaceFrequency", &FskParams::spaceFrequency)
        ;

    value_object<StackmatState>("StackmatState")
        .field("millis", &StackmatState::millis)
        .field("generation", &StackmatState::generation)
        .field("commandByte", &StackmatState::commandByte)
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

    class_<Receiver<int>>("intReceiver")
        .function("receive", &Receiver<int>::receive)
        .allow_subclass<intReceiverWrapper>("intReceiverWrapper")
        ;

    class_<Receiver<StackmatState>>("stackmatstateReceiver")
        .function("receive", &Receiver<StackmatState>::receive)
        .allow_subclass<stackmatstateReceiverWrapper>("stackmatstateReceiverWrapper")
        ;

    class_<Sender<bool, double>, base<Receiver<bool>>>("boolReceiver_doubleSender")
        .function("connect", &Sender<bool, double>::connect, allow_raw_pointers())
        ;

    class_<Sender<double, bool>, base<Receiver<double>>>("doubleReceiver_boolSender")
        .function("connect", &Sender<double, bool>::connect, allow_raw_pointers())
        ;

    class_<Sender<int, bool>, base<Receiver<int>>>("intReceiver_boolSender")
        .function("connect", &Sender<int, bool>::connect, allow_raw_pointers())
        ;

    class_<Sender<bool, int>, base<Receiver<bool>>>("boolReceiver_intSender")
        .function("connect", &Sender<bool, int>::connect, allow_raw_pointers())
        ;

    class_<Sender<int, StackmatState>, base<Receiver<int>>>("intReceiver_stackmatstateSender")
        .function("connect", &Sender<int, StackmatState>::connect, allow_raw_pointers())
        ;

    class_<Sender<StackmatState, int>, base<Receiver<StackmatState>>>("stackmatstateReceiver_intSender")
        .function("connect", &Sender<StackmatState, int>::connect, allow_raw_pointers())
        ;

    class_<Modulator, base<Sender<bool, double>>>("Modulator")
        .constructor<FskParams>()
        .function("reset", &Modulator::reset)
        ;

    class_<Demodulator, base<Sender<double, bool>>>("Demodulator")
        .constructor<FskParams>()
        .function("flush", &Demodulator::flush)
        ;

    class_<Rs232Synthesizer, base<Sender<int, bool>>>("Rs232Synthesizer")
        .constructor()
        ;

    class_<Rs232Interpreter, base<Sender<bool, int>>>("Rs232Interpreter")
        .constructor()
        .function("reset", &Rs232Interpreter::reset)
        ;

    class_<StackmatSynthesizer, base<Sender<StackmatState, int>>>("StackmatSynthesizer")
        .constructor()
        ;

    class_<StackmatInterpreter, base<Sender<int, StackmatState>>>("StackmatInterpreter")
        .constructor()
        .function("reset", &StackmatInterpreter::reset)
        ;
}

}
