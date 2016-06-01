package com.taskwc2.controller.data;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.PowerManager;
import android.text.TextUtils;

import com.taskwc2.App;

import org.kvj.bravo7.log.Logger;
import org.kvj.bravo7.util.Tasks;

public class SyncIntentReceiver extends BroadcastReceiver {

    Controller controller = App.controller();
    Logger logger = Logger.forInstance(this);

    @Override
    public void onReceive(final Context context, final Intent intent) {
        // Lock and run sync
        final PowerManager.WakeLock lock = controller.lock();
        lock.acquire();
        logger.d("Sync from receiver", intent.getData());
        new Tasks.SimpleTask<String>() {

            @Override
            protected String doInBackground() {
                String account = intent.getStringExtra(App.KEY_ACCOUNT);
                if (TextUtils.isEmpty(account)) {
                    account = controller.defaultAccount();
                }
                AccountController acc = controller.accountController(account, false);
                if (null == acc) return "Invalid account";
                return acc.taskSync();
            }

            @Override
            protected void onPostExecute(String s) {
                logger.d("Sync from receiver done:", s);
                if (null != s) {
                    // Failed
                    controller.messageShort(s);
                }
                lock.release();
            }
        }.exec();
    }
}
