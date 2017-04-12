package com.taskwc2;

import android.content.Intent;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.taskwc2.controller.data.AccountController;
import com.taskwc2.controller.data.Controller;

import org.kvj.bravo7.form.FormController;
import org.kvj.bravo7.form.impl.ViewFinder;
import org.kvj.bravo7.form.impl.bundle.StringBundleAdapter;
import org.kvj.bravo7.form.impl.widget.TransientAdapter;
import org.kvj.bravo7.log.Logger;
import org.kvj.bravo7.util.DataUtil;
import org.kvj.bravo7.widget.Dialogs;

import java.util.List;


public class AppActivity extends ReactActivity implements Controller.TaskListener {

    Logger logger = Logger.forInstance(this);
    Controller controller = App.controller();
    FormController form = new FormController(new ViewFinder.ActivityViewFinder(this));
    private AccountController acc = null;

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "taskwc2";
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        form.save(outState);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        form.add(new TransientAdapter<>(new StringBundleAdapter(), null), App.KEY_ACCOUNT);
        form.load(this, savedInstanceState);
        acc = controller.accountController(form, true);
        super.onCreate(savedInstanceState);
        if (null == acc) { // Invalid
            finish();
            return;
        }
        controller.listeners().add(this);
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
                Dialogs.questionDialog(AppActivity.this, null, question, new Dialogs.Callback<Integer>() {
                    @Override
                    public void run(Integer data) {
                        callback.call(data);
                    }
                }, answers.toArray(new String[0]));
            }
        });
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == App.EDIT_TASKRC_REQUEST && acc != null) {
            MainActivity.openForAccount(this, acc, null);
        }
    }
}
