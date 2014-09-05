package com.jflei.fskube.winston.util;

public class Stopwatch {

    public enum TimerState {
        NO_WARNING,
        FIRST_WARNING,
        SECOND_WARNING,
        PLUS_TWO,
        DNF;
    }

    private static final int MAX_INSPECTION_TIME_MILLIS = 17000;
    private static final int FIRST_WARNING_MILLIS = 8000;
    private static final int SECOND_WARNING_MILLIS = 12000;
    private static final int THIRD_WARNING_MILLIS = 15000;

    private long mStartTime = 0;
    private long mStopTime = 0;
    private boolean mIsRunning = false;

    public void start() {
        this.mStartTime = System.currentTimeMillis();
        this.mIsRunning = true;
    }

    public void stop() {
        this.mStopTime = System.currentTimeMillis();
        this.mIsRunning = false;
    }

    public boolean isRunning() {
        return mIsRunning;
    }

    public long getElapsedTimeMillis() {
        long elapsed;
        if (mIsRunning) {
            elapsed = (System.currentTimeMillis() - mStartTime);
        } else {
            elapsed = (mStopTime - mStartTime);
        }
        return elapsed;
    }

    public String getElapsedTimeDisplay() {
        float elapsed = getElapsedTimeMillis();
        return String.format("%.1f", elapsed / 1000);
    }

    public TimerState getTimerState() {
        long elapsed = getElapsedTimeMillis();
        if (elapsed >= MAX_INSPECTION_TIME_MILLIS) {
            return TimerState.DNF;
        }
        if (elapsed >= THIRD_WARNING_MILLIS) {
            return TimerState.PLUS_TWO;
        }
        if (elapsed >= SECOND_WARNING_MILLIS) {
            return TimerState.SECOND_WARNING;
        }
        if (elapsed >= FIRST_WARNING_MILLIS) {
            return TimerState.FIRST_WARNING;
        }
        return TimerState.NO_WARNING;
    }

}