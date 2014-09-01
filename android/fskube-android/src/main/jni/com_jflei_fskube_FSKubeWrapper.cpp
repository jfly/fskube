#include "com_jflei_fskube_FSKubeWrapper.h"
#include "capi.h"
#include "logging.h"

JNIEXPORT void JNICALL Java_com_jflei_fskube_FSKubeWrapper_initialize
  (JNIEnv *env, jclass clz, jint sampleRate) {
    fskube_initialize(sampleRate);
}

JNIEXPORT jboolean JNICALL Java_com_jflei_fskube_FSKubeWrapper_addSample
  (JNIEnv *env, jclass clz, jdouble sample) {
    return fskube_addSample(sample) ? JNI_TRUE : JNI_FALSE;
}

JNIEXPORT jint JNICALL Java_com_jflei_fskube_FSKubeWrapper_getTimeMillis
  (JNIEnv *env, jclass clz) {
    return fskube_getState().millis;
}

JNIEXPORT jstring JNICALL Java_com_jflei_fskube_FSKubeWrapper_getLogLevels
  (JNIEnv *env, jclass clz) {
    return env->NewStringUTF(getLogLevels());
}

JNIEXPORT void JNICALL Java_com_jflei_fskube_FSKubeWrapper_setLogLevels
  (JNIEnv *env, jclass clz, jstring jLogLevels) {
    const char *cLogLevels = env->GetStringUTFChars(jLogLevels, 0);
    setLogLevels(cLogLevels);
    env->ReleaseStringUTFChars(jLogLevels, cLogLevels);
}