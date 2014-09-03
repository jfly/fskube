package com.jflei.fskube.winston.activity;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.os.CountDownTimer;
import android.view.View;
import android.widget.TextView;

import com.jflei.fskube.winston.R;

/**
 * Created by pzl on 9/2/14.
 */
public class InspectionActivity extends Activity {

    private static final int MAX_INSPECTION_TIME_MILLIS = 17*1000;

    private TextView mInspectionMessage;
    private TextView mInspectionTimeDisplay;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.inspection_activity);

        mInspectionMessage = (TextView) findViewById(R.id.inspection_message);
        mInspectionTimeDisplay = (TextView) findViewById(R.id.inspection_display);

        final String inspectionEndMessage = this.getString(R.string.inspection_end_message);

        mInspectionMessage.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                mInspectionMessage.setVisibility(View.GONE);
                mInspectionTimeDisplay.setVisibility(View.VISIBLE);

                // TODO I want to use a handler for this instead, CDT is not accurate
                // TODO change background color
                // TODO I forget
                new CountDownTimer(MAX_INSPECTION_TIME_MILLIS, 1000) {

                    public void onTick(long millisUntilFinished) {
                        int currentTimeSecs = (int)
                                (1 + (MAX_INSPECTION_TIME_MILLIS - millisUntilFinished) / 1000);
                        mInspectionTimeDisplay.setText("" + currentTimeSecs);
                    }

                    public void onFinish() {
                        mInspectionMessage.setVisibility(View.VISIBLE);
                        mInspectionTimeDisplay.setVisibility(View.GONE);

                        mInspectionMessage.setText(inspectionEndMessage);
                    }
                }.start();
            }
        });
    }

}
