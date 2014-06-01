#ifndef CAPI_H
#define CAPI_H

#include "stackmat.h"

void *fskube_initialize();

void fskube_destroy(void *fskube);

bool fskube_addSample(void *fskube);

fskube::StackmatState fskube_getState(void * fskube);

#endif // CAPI_H
