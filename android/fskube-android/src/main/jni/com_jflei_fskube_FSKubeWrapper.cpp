#include "com_jflei_fskube_FSKubeWrapper.h"
#include "capi.h"

/*
 * Class:     com_jflei_fskube_FSKubeWrapper
 * Method:    initialize
 * Signature: (I)V
 */
JNIEXPORT void JNICALL Java_com_jflei_fskube_FSKubeWrapper_initialize
  (JNIEnv *env, jclass clz, jint sampleRate) {
    fskube_initialize(sampleRate);
}

/*
 * Class:     com_jflei_fskube_FSKubeWrapper
 * Method:    addSample
 * Signature: (D)V
 */
JNIEXPORT jboolean JNICALL Java_com_jflei_fskube_FSKubeWrapper_addSample
  (JNIEnv *env, jclass clz, jdouble sample) {
    return fskube_addSample(sample) ? JNI_TRUE : JNI_FALSE;
}

/*
 * Class:     com_jflei_fskube_FSKubeWrapper
 * Method:    getTimeMillis
 * Signature: ()I
 */
JNIEXPORT jint JNICALL Java_com_jflei_fskube_FSKubeWrapper_getTimeMillis
  (JNIEnv *env, jclass clz) {
    return fskube_getState().millis;
}

