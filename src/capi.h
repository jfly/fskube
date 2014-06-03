#ifndef CAPI_H
#define CAPI_H

extern "C" {

#include "stackmat.h"

// Note that this api only supports interpreting one stackmat at a time.
// This seems fine to me.
void fskube_initialize(unsigned int sampleRate);

bool fskube_addSample(double sample);

fskube::StackmatState fskube_getState();

}

#endif // CAPI_H
