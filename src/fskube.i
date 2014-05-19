%module(directors="1") fskube
%feature("director");

%{
/* Includes the header in the wrapper code */
#include "fskube.h"
%}

/* Parse the header file to generate wrappers */
%include "receiversender.h"

%template(boolReceiver) fskube::Receiver<bool>;
%template(doubleReceiver) fskube::Receiver<double>;
%template(intReceiver) fskube::Receiver<int>;

%template(boolReceiver_doubleSender) fskube::Sender<bool, double>;
%template(doubleReceiver_boolSender) fskube::Sender<double, bool>;
%template(intReceiver_boolSender) fskube::Sender<int, bool>;
%template(boolReceiver_intSender) fskube::Sender<bool, int>;

%include "fskube.h"
