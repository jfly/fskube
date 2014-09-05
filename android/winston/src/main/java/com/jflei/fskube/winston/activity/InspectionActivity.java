package com.jflei.fskube.winston.activity;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.view.MotionEvent;
import android.view.View;
import android.widget.TextView;

import com.jflei.fskube.winston.R;
import com.jflei.fskube.winston.util.Stopwatch;

public class InspectionActivity extends Activity implements View.OnTouchListener {

    private static final String TAG = "InspectionActivity";

    private static final int REFRESH_RATE_MILLIS = 50;

    private Stopwatch mStopwatch;
    private Handler mHandler;
    private Runnable mRunnable;

    private TextView mInspectionEnterMessage;
    private TextView mInspectionTimeDisplay;

    private Stopwatch.TimerState mTimerState;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.inspection_activity);

        mInspectionEnterMessage = (TextView) findViewById(R.id.inspection_enter_message);
        mInspectionTimeDisplay = (TextView) findViewById(R.id.inspection_display);

        mInspectionEnterMessage.setOnTouchListener(this);
        mInspectionTimeDisplay.setOnTouchListener(this);

        mStopwatch = new Stopwatch();
        mHandler = new Handler();
        mRunnable = new Runnable() {
            @Override
            public void run() {
                if (mStopwatch.isRunning()) {
                    updateDisplayAndColor();
                    mHandler.postDelayed(this, REFRESH_RATE_MILLIS);
                }
            }
        };
    }

    @Override
    public boolean onTouch(View view, MotionEvent event) {
        if (event.getAction() == MotionEvent.ACTION_DOWN) {
            if (mStopwatch.isRunning()) {
                stopTimer();
            } else {
                startTimer();
            }
        }
        return false;
    }

    private void startTimer() {
        mStopwatch = new Stopwatch();
        mTimerState = Stopwatch.TimerState.NO_WARNING;
        mInspectionTimeDisplay.setBackgroundColor(getResources().getColor(R.color.green));
        mInspectionEnterMessage.setVisibility(View.GONE);
        mInspectionTimeDisplay.setVisibility(View.VISIBLE);

        mStopwatch.start();
        mHandler.postDelayed(mRunnable, REFRESH_RATE_MILLIS);
    }

    private void stopTimer() {
        mHandler.removeCallbacks(mRunnable);
        mStopwatch.stop();
    }

    private void updateDisplayAndColor() {
        if (mStopwatch.isRunning()) {
            mInspectionTimeDisplay.setText(mStopwatch.getElapsedTimeDisplay());

            Stopwatch.TimerState timerState = mStopwatch.getTimerState();
            if (timerState != mTimerState) {
                switch (timerState) {
                    case NO_WARNING:
                        mInspectionTimeDisplay.setBackgroundColor(
                                getResources().getColor(R.color.green));
                        break;

                    case FIRST_WARNING:
                        mInspectionTimeDisplay.setBackgroundColor(
                                getResources().getColor(R.color.yellow));
                        break;

                    case SECOND_WARNING:
                        mInspectionTimeDisplay.setBackgroundColor(
                                getResources().getColor(R.color.orange));
                        break;

                    case PLUS_TWO:
                        mInspectionTimeDisplay.setBackgroundColor(
                                getResources().getColor(R.color.red));
                        break;

                    case DNF:
                        mInspectionTimeDisplay.setText(
                                getResources().getString(R.string.inspection_dnf_message));
                        mInspectionTimeDisplay.setBackgroundColor(
                                getResources().getColor(R.color.dark_red));
                        stopTimer();
                        break;
                }
            }
        }

    }

}
