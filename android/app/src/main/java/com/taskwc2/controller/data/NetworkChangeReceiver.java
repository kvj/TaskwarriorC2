package com.taskwc2.controller.data;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.support.v4.net.ConnectivityManagerCompat;

import com.taskwc2.App;

import org.kvj.bravo7.log.Logger;

public class NetworkChangeReceiver extends BroadcastReceiver {

    Controller controller = App.controller();
    Logger logger = Logger.forInstance(this);

    @Override
    public void onReceive(Context context, Intent intent) {
        ConnectivityManager cm =
            (ConnectivityManager) controller.context().getSystemService(Context.CONNECTIVITY_SERVICE);
        NetworkInfo
            info = ConnectivityManagerCompat.getNetworkInfoFromBroadcast(cm, intent);
        logger.d("Network changed:", info);
        if (null != info && info.isConnected()) {
            // Connected to network
            for (String id : controller.accountFolders()) {
                AccountController acc = controller.accountController(id, false);
                if (null == acc) continue;
                if (acc.syncOnConnection(info)) {
                    logger.d("Auto-sync on connection", id, info);
                    SyncIntentReceiver sir = new SyncIntentReceiver();
                    Intent syncIntent = new Intent();
                    syncIntent.putExtra(App.KEY_ACCOUNT, id);
                    sir.onReceive(context, syncIntent);
                }
            }
        }
    }
}
