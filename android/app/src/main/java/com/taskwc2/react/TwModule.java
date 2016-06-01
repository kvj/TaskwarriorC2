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

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Created by kvorobyev on 6/1/16.
 */
public class TwModule extends ReactContextBaseJavaModule {

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

    @ReactMethod
    public void call(ReadableArray args, Callback linesEater, Boolean api, Promise promise) {
        if (null == acc) { // Invalid
            promise.reject("not_configured", "Profile not configured");
            return;
        }
        acc.callTask(new AccountController.StreamConsumer() {
            @Override
            public void eat(String line) {
            }
        }, new AccountController.StreamConsumer() {
            @Override
            public void eat(String line) {
            }
        }, api);
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
