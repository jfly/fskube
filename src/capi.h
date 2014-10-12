#ifndef CAPI_H
#define CAPI_H

#include "stackmat.h"

extern "C" {

// Note that this api only supports interpreting one stackmat at a time.
// This seems fine to me.
void fskube_initialize(unsigned int sampleRate);

bool fskube_addSample(double sample);

fskube::StackmatState fskube_getState();

bool fskube_isRunning();

}

#endif // CAPI_H
