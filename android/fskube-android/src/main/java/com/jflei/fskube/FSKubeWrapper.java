package com.jflei.fskube;

public class FSKubeWrapper {
    static {
        System.loadLibrary("fskube");
    }

    public static native void initialize(int sampleRate);

    public static native boolean addSample(double sample);

    public static native int getTimeMillis();

}
