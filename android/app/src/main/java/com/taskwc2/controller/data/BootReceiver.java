package com.taskwc2.controller.data;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import com.taskwc2.App;

import org.kvj.bravo7.log.Logger;

public class BootReceiver extends BroadcastReceiver {

    Controller controller = App.controller();
    Logger logger = Logger.forInstance(this);

    @Override
    public void onReceive(Context context, Intent intent) {
        logger.i("Application started");
        controller.messageShort("Auto-sync timers have started");
    }
}
