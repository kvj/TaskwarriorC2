package com.taskwc2;

import android.Manifest;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.text.TextUtils;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.taskwc2.controller.data.AccountController;
import com.taskwc2.controller.data.Controller;
import com.taskwc2.react.TwModule;

import org.kvj.bravo7.form.FormController;
import org.kvj.bravo7.form.impl.ViewFinder;
import org.kvj.bravo7.form.impl.bundle.StringBundleAdapter;
import org.kvj.bravo7.form.impl.widget.TransientAdapter;
import org.kvj.bravo7.log.Logger;
import org.kvj.bravo7.util.DataUtil;
import org.kvj.bravo7.widget.Dialogs;

import java.util.ArrayList;
import java.util.List;


public class MainActivity extends ReactActivity implements Controller.TaskListener {

    Logger logger = Logger.forInstance(this);
    Controller controller = App.controller();
    FormController form = new FormController(new ViewFinder.ActivityViewFinder(this));
    private boolean allGranted = false;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "taskwc2";
    }

    /**
     * Returns whether dev mode should be enabled.
     * This enables e.g. the dev menu.
     */
    @Override
    protected boolean getUseDeveloperSupport() {
        return BuildConfig.DEBUG;
    }

    /**
     * A list of packages used by the app. If the app uses additional views
     * or modules besides the default ones, add more packages here.
     */
    @Override
    protected List<ReactPackage> getPackages() {
        List<ReactPackage> list = new ArrayList<>();
        list.add(new MainReactPackage());
        if (!allGranted) return list;
        AccountController acc = controller.accountController(form, true);
        if (null == acc) { // Ask about new profile
            Dialogs.questionDialog(this, "Create new Profile?", null, new Dialogs.Callback<Integer>() {
                @Override
                public void run(Integer data) {
                    String message = controller.createAccount(null); // Random
                    if (!TextUtils.isEmpty(message)) { // Error
                        controller.messageLong(message);
                    } else {
                        startActivity(new Intent(MainActivity.this, MainActivity.class));
                    }
                }
            }).setOnDismissListener(new DialogInterface.OnDismissListener() {
                @Override
                public void onDismiss(DialogInterface dialog) {
                    finish();
                }
            });
            return list;
        }
        list.add(new TwModule.TwPackage(acc));
        return list;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions,
                                           int[] grantResults) {
        finish();
        startActivity(new Intent(MainActivity.this, MainActivity.class));
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        this.allGranted =
            ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
            && ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
        controller.listeners().add(this);
        form.add(new TransientAdapter<>(new StringBundleAdapter(), controller.defaultAccount()), App.KEY_ACCOUNT);
        form.load(this, savedInstanceState);
        if (!allGranted) {
            ActivityCompat
                .requestPermissions(this, new String[]{
                    Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.WRITE_EXTERNAL_STORAGE}, App.PERMISSION_REQUEST);
        }
        super.onCreate(savedInstanceState);
    }

    @Override
    protected void onStart() {
        super.onStart();
    }

    @Override
    protected void onDestroy() {
        controller.listeners().remove(this);
        super.onDestroy();
    }

    @Override
    public void onQuestion(final String question, final DataUtil.Callback<Integer> callback, final List<String> answers) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                Dialogs.questionDialog(MainActivity.this, null, question, new Dialogs.Callback<Integer>() {
                    @Override
                    public void run(Integer data) {
                        callback.call(data);
                    }
                }, answers.toArray(new String[0]));
            }
        });
    }
}
