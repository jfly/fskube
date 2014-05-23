%module(directors="1") fskube
%feature("director");

%include "carrays.i"
%array_class(bool, boolArray);

%{
#include "fsk.h"
#include "rs232.h"
#include "stackmat.h"
#include "logging.h"
%}

%include "receiversender.h"
%include "logging.h"

%copyctor fskube::StackmatState;

/*
It looks like this is causing issues on swig 2 =(
%typemap(directorin) fskube::StackmatState {
    // Simulate C style pass by value semantics by constructing a new StackmatState object
    // on the heap and letting python's garbage collector manage the object. If we don't do this,
    // python code that holds on to a pointer to StackmatState arguments will get messed up
    // when the underlying C object is cleaned up.
    fskube::StackmatState *copy = (fskube::StackmatState *)new fskube::StackmatState($1);
    $input = SWIG_NewPointerObj(SWIG_as_voidptr(copy), SWIGTYPE_p_fskube__StackmatState, SWIG_POINTER_OWN);
}
*/

%pythoncode %{
import inspect
class LOG_HANDLE(object):
    def __init__(self, name=None):
        if name is None:
            callerFile = inspect.stack()[1][1]
            name = inspect.getmoduleinfo(callerFile).name
        lh = createLogHandle(name)  
        self.lh = lh

        def buildLog(level):
            def log(*args, **kwargs):
                if isLogLevelEnabled(lh, level):
                    print("{}/{} ".format(lh.name, level), end="")
                    print(*args, **kwargs)
            return log
            
        for l in range(0, MAX_LOG_LEVEL + 1):
            self.__setattr__("log{}".format(l), buildLog(l))
%}

%template(boolReceiver) fskube::Receiver<bool>;
%template(doubleReceiver) fskube::Receiver<double>;
%template(intReceiver) fskube::Receiver<int>;
%template(stackmatstateReceiver) fskube::Receiver<fskube::StackmatState>;

%template(boolReceiver_doubleSender) fskube::Sender<bool, double>;
%template(doubleReceiver_boolSender) fskube::Sender<double, bool>;
%template(intReceiver_boolSender) fskube::Sender<int, bool>;
%template(boolReceiver_intSender) fskube::Sender<bool, int>;
%template(stackmatstateReceiver_intSender) fskube::Sender<fskube::StackmatState, int>;
%template(intReceiver_stackmatstateSender) fskube::Sender<int, fskube::StackmatState>;

%include "fsk.h"
%include "rs232.h"
%include "stackmat.h"
