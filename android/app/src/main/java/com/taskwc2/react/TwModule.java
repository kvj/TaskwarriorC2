package com.taskwc2.react;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ViewManager;
import com.taskwc2.controller.data.AccountController;

import org.kvj.bravo7.log.Logger;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Created by kvorobyev on 6/1/16.
 */
public class TwModule extends ReactContextBaseJavaModule {

    Logger logger = Logger.forInstance(this);
    private AccountController acc;

    public TwModule(ReactApplicationContext reactContext, AccountController acc) {
        super(reactContext);
        this.acc = acc;
    }

    @Override
    public String getName() {
        return "TwModule";
    }

    @ReactMethod
    public void init(ReadableMap config, Promise promise) {
        promise.resolve(acc != null);
        return;
    }

    class ArrayEater implements AccountController.StreamConsumer {

        final List<String> array = new ArrayList<>();

        @Override
        public void eat(String line) {
            array.add(line);
        }

        String[] array() {
            return array.toArray(new String[size()]);
        }

        int size() {
            return array.size();
        }
    }

    @ReactMethod
    public void call(ReadableArray args, final Callback linesEater) {
//        logger.d("Call:", args, linesEater, acc);
        if (null == acc) { // Invalid
            linesEater.invoke("error", "Profile not configured");
            return;
        }
        ArrayEater out = new ArrayEater();
        ArrayEater err = new ArrayEater();
        String[] arguments = new String[args.size()];
        for (int i = 0; i < args.size(); i++) {
            arguments[i] = args.getString(i);
        }
        int code = acc.callTask(out, err, null, false, arguments);
        Object[] result = new Object[out.size()+err.size()+4];
        result[0] = "success";
        result[1] = code;
        result[2] = out.size();
        result[3] = err.size();
        System.arraycopy(out.array(), 0, result, 4, out.size());
        System.arraycopy(err.array(), 0, result, 4+out.size(), err.size());
        linesEater.invoke(result);
    }

    public static class TwPackage implements ReactPackage {

        private final AccountController acc;

        public TwPackage(AccountController acc) {
            this.acc = acc;
        }

        @Override
        public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
            List<NativeModule> modules = new ArrayList<>();
            modules.add(new TwModule(reactContext, acc));
            return modules;
        }

        @Override
        public List<Class<? extends JavaScriptModule>> createJSModules() {
            return Collections.emptyList();
        }

        @Override
        public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
            return Collections.emptyList();
        }
    }
}
