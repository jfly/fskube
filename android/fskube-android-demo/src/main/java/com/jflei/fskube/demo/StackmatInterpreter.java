package com.jflei.fskube.demo;

import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.view.Menu;
import android.view.MenuItem;
import android.os.Handler;

public class StackmatInterpreter extends ActionBarActivity
        implements NavigationDrawerFragment.NavigationDrawerCallbacks {
    public static final int SAMPLE_RATE = 44100;
    private static final int BUFFER_SIZE = 8*1024;
    private static final int CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO;
    private static final int AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT;

    private Handler mHandler;
    public AudioRecord mAudioRecord;
    private RecordRunnable mRecordRunnable;

    private MicrophoneListener currentListener = null;

    /**
     * Fragment managing the behaviors, interactions and presentation of the navigation drawer.
     */
    private NavigationDrawerFragment mNavigationDrawerFragment;

    /**
     * Used to store the last screen title. For use in {@link #restoreActionBar()}.
     */
    private CharSequence mTitle;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_stackmat_interpreter);

        mNavigationDrawerFragment = (NavigationDrawerFragment)
                getSupportFragmentManager().findFragmentById(R.id.navigation_drawer);
        mTitle = getTitle();
        mHandler = new Handler();

        // Set up the drawer.
        mNavigationDrawerFragment.setUp(
                R.id.navigation_drawer,
                (DrawerLayout) findViewById(R.id.drawer_layout));

        mAudioRecord = new AudioRecord(MediaRecorder.AudioSource.MIC, SAMPLE_RATE,
                CHANNEL_CONFIG, AUDIO_FORMAT, BUFFER_SIZE);
        mRecordRunnable = new RecordRunnable(mAudioRecord, BUFFER_SIZE);
    }

    @Override
    protected void onStart() {
        super.onStart();
        mRecordRunnable.running = true;
        new Thread(mRecordRunnable).start();
    }

    @Override
    protected void onPause() {
        super.onPause();
        mRecordRunnable.running = false;
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        synchronized(mAudioRecord) {
            mAudioRecord.release();
        }
    }

    @Override
    public void onNavigationDrawerItemSelected(int position) {
        // update the main content by replacing fragments
        FragmentManager fragmentManager = getSupportFragmentManager();
        Fragment currentFragment = null;
        if(position == 0) {
            DisplayFragment df = new DisplayFragment();
            currentListener = df;
            currentFragment = df;
        } else if(position == 1) {
            OscilloscopeFragment of = new OscilloscopeFragment();
            currentListener = of;
            currentFragment = of;
        } else {
            assert false;
        }
        fragmentManager.beginTransaction()
                .replace(R.id.container, currentFragment)
                .commit();
    }

    public void onSectionAttached(String sectionTitle) {
        mTitle = sectionTitle;
    }

    public void restoreActionBar() {
        ActionBar actionBar = getSupportActionBar();
        actionBar.setNavigationMode(ActionBar.NAVIGATION_MODE_STANDARD);
        actionBar.setDisplayShowTitleEnabled(true);
        actionBar.setTitle(mTitle);
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        if (!mNavigationDrawerFragment.isDrawerOpen()) {
            // Only show items in the action bar relevant to this screen
            // if the drawer is not showing. Otherwise, let the drawer
            // decide what to show in the action bar.
            getMenuInflater().inflate(R.menu.stackmat_interpreter, menu);
            restoreActionBar();
            return true;
        }
        return super.onCreateOptionsMenu(menu);
    }

    private class RecordRunnable implements Runnable {

        private final AudioRecord mAudioRecord;
        private short[] mBuffer;
        private double[] normalizedSamples;
        private boolean running;

        public RecordRunnable(AudioRecord record, int bufSize) {
            mAudioRecord = record;
            mBuffer = new short[bufSize];
            normalizedSamples = new double[bufSize];
        }

        @Override
        public void run() {
            synchronized(mAudioRecord) {
                mAudioRecord.startRecording();
                while(running) {
                    int bytesRead = 0;
                    while(bytesRead < mBuffer.length) {
                        bytesRead += mAudioRecord.read(mBuffer, bytesRead, mBuffer.length - bytesRead);
                    }
                    for(int i = 0; i < mBuffer.length; i++) {
                        double shortSample = mBuffer[i];
                        double sample = shortSample >= 0 ? (shortSample / Short.MAX_VALUE) : -(shortSample / Short.MIN_VALUE);
                        normalizedSamples[i] = sample;
                    }
                    currentListener.handleSamples(normalizedSamples);
                }
                mAudioRecord.stop();
            }
        }

    }
}
