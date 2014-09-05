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
    private static final String PACKAGE_NAME_PREFIX = "com.jflei.fskube.winston.activity.";
    private static final String[] DASHBOARD_ITEMS = {"Inspection Tool"};
    private static final String[] DASHBOARD_ACTIVITIES = {"InspectionActivity"};

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
                if (position > DASHBOARD_ITEMS.length || position > DASHBOARD_ACTIVITIES.length) {
                    Log.e(TAG, "Not enough items in dashboard array; position " + position);
                } else {
                    Context context = view.getContext();
                    String className = PACKAGE_NAME_PREFIX + DASHBOARD_ACTIVITIES[position];
                    Intent intent = null;
                    try {
                        intent = new Intent(context, Class.forName(className));
                        context.startActivity(intent);
                    } catch (ClassNotFoundException e) {
                        Log.e(TAG, "Class not found for name " + className);
                    }
                }
            }
        });
    }

}
