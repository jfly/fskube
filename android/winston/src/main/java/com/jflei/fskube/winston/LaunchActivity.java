package com.jflei.fskube.winston;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import com.jflei.fskube.winston.activity.InspectionActivity;

/**
 * this will be a launcher for everything until we figure out what the flow is going to be
 */
public class LaunchActivity extends Activity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.launch_activity); // TODO change this to a listview

        TextView inspectionLauncher = (TextView) findViewById(R.id.inspection_launcher);
        inspectionLauncher.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Context context = view.getContext();
                Intent intent = new Intent(context, InspectionActivity.class);
                context.startActivity(intent);
            }
        });
    }

}
