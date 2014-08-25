package com.jflei.fskube.demo;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import com.jflei.fskube.FSKubeWrapper;

public class DisplayFragment extends Fragment implements MicrophoneListener {

    public DisplayFragment() {
    }

    private Handler handler;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        handler = new Handler();
        FSKubeWrapper.initialize(StackmatInterpreter.SAMPLE_RATE);
        return inflater.inflate(R.layout.fragment_display, container, false);
    }

    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);
        ((StackmatInterpreter) activity).onSectionAttached(getString(R.string.title_display));
    }

    @Override
    public void onStart() {
        super.onStart();
    }

    @Override
    public void onStop() {
        super.onStop();
    }

    @Override
    public void onResume() {
        super.onResume();
    }

    @Override
    public void onPause() {
        super.onPause();
    }

    @Override
    public void handleSamples(double[] samples) {
        for(double sample : samples) {
            if(FSKubeWrapper.addSample(sample)) {
                final int millis = FSKubeWrapper.getTimeMillis();
                handler.post(new Runnable() {
                    @Override
                    public void run() {
                        if(getView() == null) {
                            return;
                        }
                        TextView displayTime = (TextView) getView().findViewById(R.id.display_time);
                        displayTime.setText("" + millis);
                    }
                });
            }
        }
    }
}