package com.jflei.fskube.winston.activity;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.view.View;
import android.widget.TextView;

import com.jflei.fskube.winston.R;
import com.jflei.fskube.winston.util.Stopwatch;

/**
 * Created by pzl on 9/2/14.
 */
public class InspectionActivity extends Activity implements View.OnClickListener {

    private static final String TAG = "InspectionActivity";

    private static final int REFRESH_RATE_MILLIS = 100;

    private static final int MSG_START_TIMER = 0;
    private static final int MSG_UPDATE_TIMER = 1;
    private static final int MSG_STOP_TIMER = 2;

    private Stopwatch mTimer;
    private Handler mHandler;

    private TextView mInspectionEnterMessage;
    private TextView mInspectionTimeDisplay;
    private TextView mInspectionDNFMessage;

    private Stopwatch.TimerState mTimerState;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.inspection_activity);

        mInspectionEnterMessage = (TextView) findViewById(R.id.inspection_enter_message);
        mInspectionTimeDisplay = (TextView) findViewById(R.id.inspection_display);
        mInspectionDNFMessage = (TextView) findViewById(R.id.inspection_dnf_message);

        mInspectionEnterMessage.setOnClickListener(this);
        mInspectionTimeDisplay.setOnClickListener(this);
        mInspectionDNFMessage.setOnClickListener(this);

        // adapted from http://stackoverflow.com/a/3734070/665632
        mTimer = new Stopwatch();
        mHandler = new Handler() {
            @Override
            public void handleMessage(Message msg) {
                super.handleMessage(msg);
                switch (msg.what) {
                    case MSG_START_TIMER:
                        mTimer.start();
                        mInspectionEnterMessage.setVisibility(View.GONE);
                        mInspectionDNFMessage.setVisibility(View.GONE);
                        mInspectionTimeDisplay.setVisibility(View.VISIBLE);
                        mHandler.sendEmptyMessage(MSG_UPDATE_TIMER);
                        break;

                    case MSG_UPDATE_TIMER:
                        mInspectionTimeDisplay.setText(mTimer.getElapsedTimeDisplay());
                        mHandler.sendEmptyMessageDelayed(MSG_UPDATE_TIMER, REFRESH_RATE_MILLIS);

                        Stopwatch.TimerState timerState = mTimer.getTimerState();
                        if (timerState != mTimerState) {
                            mTimerState = timerState;
                            updateBackgroundColor(mTimerState);
                        }
                        break;

                    case MSG_STOP_TIMER:
                        mHandler.removeMessages(MSG_UPDATE_TIMER);
                        mTimer.stop();
                        break;

                    default:
                        Log.e(TAG, "Sent Handler an invalid message; " + msg.toString());
                        break;
                }
            }
        };
    }

    @Override
    public void onClick(View v) {
        if(mTimer.isRunning()) {
            mHandler.sendEmptyMessage(MSG_STOP_TIMER);
        } else {
            reset();
            mHandler.sendEmptyMessage(MSG_START_TIMER);
        }
    }

    private void reset() {
        mTimer = new Stopwatch();
        mTimerState = Stopwatch.TimerState.NO_WARNING;
        mInspectionTimeDisplay.setBackgroundColor(getResources().getColor(R.color.green));
    }

    private void updateBackgroundColor(Stopwatch.TimerState timerState) {
        switch (timerState) {
            case NO_WARNING:
                mInspectionEnterMessage.setVisibility(View.GONE);
                mInspectionDNFMessage.setVisibility(View.GONE);
                mInspectionTimeDisplay.setVisibility(View.VISIBLE);
                mInspectionTimeDisplay.setBackgroundColor(getResources().getColor(R.color.green));
                break;

            case FIRST_WARNING:
                mInspectionTimeDisplay.setBackgroundColor(getResources().getColor(R.color.yellow));
                break;

            case SECOND_WARNING:
                mInspectionTimeDisplay.setBackgroundColor(getResources().getColor(R.color.orange));
                break;

            case PLUS_TWO:
                mInspectionTimeDisplay.setBackgroundColor(getResources().getColor(R.color.red));
                break;

            case DNF:
                mInspectionTimeDisplay.setVisibility(View.GONE);
                mInspectionDNFMessage.setVisibility(View.VISIBLE);
                mHandler.sendEmptyMessage(MSG_STOP_TIMER);
                break;
        }
    }

}
