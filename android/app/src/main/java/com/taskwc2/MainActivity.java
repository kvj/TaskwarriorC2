package com.taskwc2;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.text.TextUtils;

import com.taskwc2.controller.data.AccountController;
import com.taskwc2.controller.data.Controller;
import com.taskwc2.controller.data.ProfileArchiver;

import org.kvj.bravo7.form.FormController;
import org.kvj.bravo7.form.impl.ViewFinder;
import org.kvj.bravo7.form.impl.bundle.StringBundleAdapter;
import org.kvj.bravo7.form.impl.widget.TransientAdapter;
import org.kvj.bravo7.log.Logger;
import org.kvj.bravo7.util.Tasks;
import org.kvj.bravo7.widget.Dialogs;

import java.io.IOException;

/**
 * Created by kvorobyev on 6/13/16.
 */
public class MainActivity extends AppCompatActivity {

    Logger logger = Logger.forInstance(this);
    Controller controller = App.controller();
    FormController form = new FormController(new ViewFinder.ActivityViewFinder(this));
    final String[] permissions = {
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
    };

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        step1();
    }

    private boolean areAllPermissionsGranted() {
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                // Not granted
                return false;
            }
        }
        return true;
    }

    private void step1() {
        if (!areAllPermissionsGranted()) {
            ActivityCompat.requestPermissions(this, permissions, App.PERMISSION_REQUEST);
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
        if (handleRestoreBackup(getIntent())) // Handle restore backup intent
            return;
        if (handleExternalLink(getIntent())) // External link check
            return;
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

    private boolean handleExternalLink(Intent intent) {
        if (null == intent || null == intent.getData())
            return false;
        if (!intent.getData().getScheme().startsWith("tw+"))
            return false;
        AccountController acc = controller.accountController(intent.getData().getAuthority(), false);
        if (null == acc)
            return false;
        step3(acc);
        return true;
    }

    private boolean handleRestoreBackup(Intent intent) {
        if (null == intent) return false;
        Uri backupUri = null;
        if (Intent.ACTION_SEND.equals(intent.getAction()) && intent.getClipData() != null && intent.getClipData().getItemCount() > 0) {
            backupUri = intent.getClipData().getItemAt(0).getUri();
        }
        if (Intent.ACTION_VIEW.equals(intent.getAction())) {
            backupUri = intent.getData();
        }
        if (null == backupUri || !"file".equals(backupUri.getScheme())) return false;
        final String finalBackupUri = backupUri.toString();
        Dialogs.questionDialog(this, "Restore Profile from backup?", null, new Dialogs.Callback<Integer>() {
            @Override
            public void run(final Integer data) {
                new Tasks.ActivitySimpleTask<String>(MainActivity.this) {

                    @Override
                    public void finish(String result) {
                        MainActivity.this.finish();
                        if (null == result) return;
                        Intent intent = new Intent(MainActivity.this, AppActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        intent.putExtra(App.KEY_ACCOUNT, result);
                        MainActivity.this.startActivityForResult(intent, App.MAIN_ACTIVITY_REQUEST);
                    }

                    @Override
                    protected String doInBackground() {
                        if (data != 0) return null; // Answered 'No'
                        try {
                            return ProfileArchiver.restoreArchivedProfile(controller, finalBackupUri);
                        } catch (IOException e) {
                            e.printStackTrace();
                            controller.messageLong(e.getMessage());
                            return null;
                        }
                    }
                }.exec();
            }
        });
        return true;
    }

    private void step3(AccountController acc) {
        openForAccount(this, acc, getIntent());
    }

    static void openForAccount(Activity activity, AccountController acc, Intent original) {
        activity.finish();
        Intent intent = new Intent(activity, AppActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        intent.putExtra(App.KEY_ACCOUNT, acc.id());
        if (null != original && null != original.getData())
            intent.setData(original.getData());
        activity.startActivityForResult(intent, App.MAIN_ACTIVITY_REQUEST);
    }
}
