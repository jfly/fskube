package com.jflei.fskube.demo;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;

import com.jjoe64.graphview.GraphView;
import com.jjoe64.graphview.GraphViewSeries;
import com.jjoe64.graphview.LineGraphView;

public class OscilloscopeFragment extends Fragment implements MicrophoneListener, View.OnClickListener {

    // Unfortunately, graphing large numbers of samples gets pretty laggy.
    // See https://github.com/jjoe64/GraphView/issues/79
    private static int RECORD_DURATION_MILLIS = 300;


    public OscilloscopeFragment() {
    }

    private Handler handler;

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        handler = new Handler();
        View view = inflater.inflate(R.layout.fragment_oscilloscope, container, false);
        Button recordButton = (Button) view.findViewById(R.id.recordButton);
        recordButton.setOnClickListener(this);
        return view;
    }

    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);
        ((StackmatInterpreter) activity).onSectionAttached(getString(R.string.title_oscilloscope));
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

    private double[] recordedSamples;
    int samplesToRecord = 0;
    int samplesRecorded = 0;

    private synchronized void startRecording(int samplesToRecord) {
        recordedSamples = new double[samplesToRecord];
        this.samplesToRecord = samplesToRecord;
        this.samplesRecorded = 0;
    }

    private synchronized void drawGraph() {
        double max = -1;
        double min = 1;
        GraphView.GraphViewData[] graphViewData = new GraphView.GraphViewData[recordedSamples.length];
        for(int i = 0; i < recordedSamples.length; i++) {
            double sample = recordedSamples[i];
            max = Math.max(max, sample);
            min = Math.min(min, sample);

            graphViewData[i] = new GraphView.GraphViewData(i, sample);
        }

        TextView sampleStats = (TextView) getView().findViewById(R.id.sample_stats);
        sampleStats.setText("max: " + max + " min: " + min);

        // init example series data
        GraphViewSeries exampleSeries = new GraphViewSeries(graphViewData);

        GraphView graphView = new LineGraphView(
            getActivity().getApplicationContext(), // context
            "GraphViewDemo" // heading
        );
        graphView.setScalable(true);
        graphView.getGraphViewStyle().setHorizontalLabelsColor(Color.BLACK);
        graphView.getGraphViewStyle().setVerticalLabelsColor(Color.BLACK);
        graphView.addSeries(exampleSeries); // data

        LinearLayout layout = (LinearLayout) getView().findViewById(R.id.graphArea);
        layout.removeAllViews();
        layout.addView(graphView);
    }

    @Override
    public synchronized void handleSamples(double[] samples) {
        if(samplesToRecord <= 0) {
            return;
        }

        for(double sample : samples) {
            samplesToRecord--;
            recordedSamples[samplesRecorded++] = sample;
            if(samplesToRecord <= 0) {
                break;
            }
        }
        if(samplesToRecord <= 0) {
            handler.post(new Runnable() {
                @Override
                public void run() {
                    Button recordButton = (Button) getView().findViewById(R.id.recordButton);
                    recordButton.setEnabled(true);
                    drawGraph();
                }
            });
        }
    }

    @Override
    public void onClick(View view) {
        StackmatInterpreter si = (StackmatInterpreter) getActivity();
        int samplesPerSecond = si.mAudioRecord.getSampleRate();
        int samplesToRecord = (RECORD_DURATION_MILLIS * samplesPerSecond) / 1000;
        startRecording(samplesToRecord);

        view.setEnabled(false);
    }
}