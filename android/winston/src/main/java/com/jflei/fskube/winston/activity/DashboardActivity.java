package com.jflei.fskube.winston.activity;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ListAdapter;
import android.widget.ListView;

import com.jflei.fskube.winston.R;

/**
 * this will be a launcher for everything until we figure out what the flow is going to be
 */
public class DashboardActivity extends Activity {

    private static final String TAG = "DashboardActivity";

    // I could move these to arrays.xml, but this is temporary anyway. Also, I don't care
    private static final String[] DASHBOARD_ITEMS = {"Inspection Tool"};

    private ListView mListView;
    private ListAdapter mListAdapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.dashboard_activity);

        mListView = (ListView) findViewById(R.id.dashboard_listview);
        mListAdapter =
                new ArrayAdapter<String>(this, R.layout.dashboard_list_item, DASHBOARD_ITEMS);
        mListView.setAdapter(mListAdapter);
        mListView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                switch(position) {
                    case 0:
                        Context context = view.getContext();
                        Intent intent = new Intent(context, InspectionActivity.class);
                        context.startActivity(intent);
                        break;
                    default:
                        Log.e(TAG, "onItemClick called on position " + position + "; unavailable");
                        break;
                }
            }
        });
    }

}
