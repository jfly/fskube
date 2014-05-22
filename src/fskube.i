%module(directors="1") fskube
%feature("director");

%{
/* Includes the header in the wrapper code */
#include "fskube.h"
%}

/* Parse the header file to generate wrappers */
%include "receiversender.h"

%copyctor fskube::StackmatState;

/*
%typemap(directorin) fskube::StackmatState {
    // Simulate C style pass by value semantics by constructing a new StackmatState object
    // on the heap and letting python's garbage collector manage the object. If we don't do this,
    // python code that holds on to a pointer to StackmatState arguments will get messed up
    // when the underlying C object is cleaned up.
    fskube::StackmatState *copy = (fskube::StackmatState *)new fskube::StackmatState($1);
    $input = SWIG_NewPointerObj(SWIG_as_voidptr(copy), SWIGTYPE_p_fskube__StackmatState, SWIG_POINTER_OWN);
}
*/

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

%include "fskube.h"
