package com.taskwc2;


import com.taskwc2.controller.data.Controller;

/**
 * Created by vorobyev on 10/4/15.
 */
public class App extends org.kvj.bravo7.ng.App<Controller> {

    public static final String ACCOUNT_TYPE = "kvj.task.account";
    public static final String KEY_ACCOUNT = "account";
    public static final String LOG_FILE = "taskw.log.txt";
    public static final int SYNC_REQUEST = 1;
    public static final int EDIT_TASKRC_REQUEST = 2;
    public static final int PERMISSION_REQUEST = 3;
    public static final int MAIN_ACTIVITY_REQUEST = 4;

    @Override
    protected Controller create() {
        return new Controller(this, "Taskwarrior");
    }

    @Override
    protected void init() {
        Controller controller = App.controller();
        for (String acc : controller.accountFolders()) {
            controller.accountController(acc, true); // This will schedule sync
        }
    }
}
