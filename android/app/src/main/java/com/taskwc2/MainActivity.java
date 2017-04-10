package com.taskwc2;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.text.TextUtils;

import com.taskwc2.controller.data.AccountController;
import com.taskwc2.controller.data.Controller;

import org.kvj.bravo7.form.FormController;
import org.kvj.bravo7.form.impl.ViewFinder;
import org.kvj.bravo7.form.impl.bundle.StringBundleAdapter;
import org.kvj.bravo7.form.impl.widget.TransientAdapter;
import org.kvj.bravo7.log.Logger;
import org.kvj.bravo7.widget.Dialogs;

/**
 * Created by kvorobyev on 6/13/16.
 */
public class MainActivity extends AppCompatActivity {

    Logger logger = Logger.forInstance(this);
    Controller controller = App.controller();
    FormController form = new FormController(new ViewFinder.ActivityViewFinder(this));

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        step1();
    }

    private void step1() {
        boolean allGranted =
                ContextCompat.checkSelfPermission(this, Manifest.permission.READ_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED
                        && ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) == PackageManager.PERMISSION_GRANTED;
        if (!allGranted) {
            ActivityCompat
                    .requestPermissions(this, new String[]{
                            Manifest.permission.READ_EXTERNAL_STORAGE, Manifest.permission.WRITE_EXTERNAL_STORAGE}, App.PERMISSION_REQUEST);
        } else {
            step2();
        }

    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        if (requestCode == App.PERMISSION_REQUEST) {
            boolean allOk = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allOk = false;
                    break;
                }
            }
            if (allOk) {
                step2();
            } else {
                finish();
            }
        }
    }

    private void step2() {
        form.add(new TransientAdapter<>(new StringBundleAdapter(), controller.defaultAccount()), App.KEY_ACCOUNT);
        form.load(this, null);
        AccountController acc = controller.accountController(form, true);
        if (null == acc) { // Ask about new profile
            Dialogs.questionDialog(this, "Create new Profile?", null, new Dialogs.Callback<Integer>() {
                @Override
                public void run(Integer data) {
                    if (data == 0) {
                        String message = controller.createAccount(null); // Random
                        if (!TextUtils.isEmpty(message)) { // Error
                            controller.messageLong(message);
                            finish();
                        } else {
                            step2();
                        }
                    } else {
                        finish();
                    }
                }
            });
        } else {
            step3(acc);
        }

    }

    private void step3(AccountController acc) {
        finish();
        Intent intent = new Intent(this, AppActivity.class);
        intent.putExtra(App.KEY_ACCOUNT, acc.id());
        startActivityForResult(intent, App.MAIN_ACTIVITY_REQUEST);
    }
}
