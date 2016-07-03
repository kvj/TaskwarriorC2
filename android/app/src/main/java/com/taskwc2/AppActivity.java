package com.taskwc2;

import android.os.Bundle;

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
        list.add(new TwModule.TwPackage(acc));
        return list;
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
}
