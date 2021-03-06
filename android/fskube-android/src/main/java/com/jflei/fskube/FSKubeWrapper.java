package com.jflei.fskube;

public class FSKubeWrapper {
    static {
        System.loadLibrary("fskube");
    }

    public static native void initialize(int sampleRate);

    public static native boolean addSample(double sample);

    public static native int getTimeMillis();

    public static native boolean isOn();

    public static native boolean isRunning();

    public static native String getLogLevels();

    public static native void setLogLevels(String logLevels);

}
