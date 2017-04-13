package com.taskwc2;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.v7.app.AppCompatActivity;
import android.text.TextUtils;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Spinner;

import com.taskwc2.controller.data.AccountController;
import com.taskwc2.controller.data.Controller;

import org.kvj.bravo7.form.FormController;
import org.kvj.bravo7.form.impl.ViewFinder;
import org.kvj.bravo7.form.impl.widget.SpinnerIntegerAdapter;
import org.kvj.bravo7.form.impl.widget.TextViewCharSequenceAdapter;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by vorobyev on 4/13/17.
 */

public class ShortcutActivity extends AppCompatActivity {

    Controller controller = App.controller();
    FormController form = new FormController(new ViewFinder.ActivityViewFinder(this));
    List<String> ids = new ArrayList<>();

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_shortcut);
        List<String> titles = new ArrayList<>();
        int selected = 0;
        for (String folder : controller.accountFolders()) {
            AccountController acc = controller.accountController(folder, false);
            if (acc == null) continue;
            if (acc.id().equals(controller.defaultAccount()))
                selected = ids.size();
            ids.add(acc.id());
            titles.add(acc.name());
        }
        if (ids.isEmpty()) {
            controller.messageLong("No profiles available");
            finish();
            return;
        }
        Spinner profiles = (Spinner) findViewById(R.id.shortcut_profile);
        profiles.setAdapter(new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, titles));
        form.add(new SpinnerIntegerAdapter(R.id.shortcut_profile, selected), "profile");
        form.add(new TextViewCharSequenceAdapter(R.id.shortcut_report, "next"), "report");
        form.add(new TextViewCharSequenceAdapter(R.id.shortcut_filter, ""), "filter");
        form.add(new TextViewCharSequenceAdapter(R.id.shortcut_title, "Taskwarrior"), "title");
        form.load(this, savedInstanceState);
        findViewById(R.id.shortcut_btn_cancel).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
        findViewById(R.id.shortcut_btn_create).setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                createShortcut();
            }
        });
    }

    private void createShortcut() {
        String id = ids.get(form.getValue("profile", Integer.class));
        String report = form.getValue("report");
        String filter = form.getValue("filter");
        if (TextUtils.isEmpty(report)) {
            controller.messageLong("Report is required");
            return;
        }
        Uri.Builder uri = new Uri.Builder().scheme("tw+tasks").authority(id).appendPath(report);
        if (!TextUtils.isEmpty(filter))
            uri = uri.appendPath(filter);
        Intent.ShortcutIconResource icon = Intent.ShortcutIconResource.fromContext(this, R.mipmap.ic_launcher);
        Intent launchIntent = new Intent(this, MainActivity.class);
        launchIntent.setData(uri.build());
        Intent intent = new Intent();
        intent.putExtra(Intent.EXTRA_SHORTCUT_NAME, form.getValue("title", String.class));
        intent.putExtra(Intent.EXTRA_SHORTCUT_ICON_RESOURCE, icon);
        intent.putExtra(Intent.EXTRA_SHORTCUT_INTENT, launchIntent);
        setResult(RESULT_OK, intent);
        finish();
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        form.save(outState);
    }
}
