package com.taskwc2.controller.data;

import android.app.Notification;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.support.v4.app.NotificationCompat;
import android.support.v4.app.NotificationManagerCompat;
import android.text.TextUtils;

import com.taskwc2.App;
import com.taskwc2.R;

import org.kvj.bravo7.form.FormController;
import org.kvj.bravo7.util.DataUtil;
import org.kvj.bravo7.util.Listeners;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Created by vorobyev on 10/4/15.
 */
public class Controller extends org.kvj.bravo7.ng.Controller {

    public interface TaskListener {
        public void onQuestion(String question, DataUtil.Callback<Integer> callback, List<String> answers);
    }

    private Listeners<TaskListener> taskListeners = new Listeners<TaskListener>();

    public static interface ToastMessageListener {

        public void onMessage(String message, boolean showLong);
    }

    protected final String executable;

    private final NotificationManagerCompat notificationManager;

    private final Listeners<ToastMessageListener> toastListeners = new Listeners<>();

    private final Map<String, AccountController> controllerMap = new HashMap<>();

    public Controller(Context context, String name) {
        super(context, name);
        executable = eabiExecutable();
        notificationManager = NotificationManagerCompat.from(context);
    }

    public File fileFromIntentUri(Intent intent) {
        if (null == intent) return null;
        if (TextUtils.isEmpty(intent.getDataString())) return null;
        if (!"file".equals(intent.getData().getScheme())) {
            logger.w("Requested Uri is not file", intent.getData().getScheme(), intent.getData());
            return null;
        }
        try {
            File file = new File(intent.getData().getPath());
            if (!file.isFile() && !file.exists()) {
                logger.w("Invalid file:", file);
                return null;
            }
            if (!file.canRead() || !file.canWrite()) {
                logger.w("Invalid file access:", file, file.canRead(), file.canWrite());
                return null;
            }
            return file;
        } catch (Exception e) {
            logger.e(e, "Error getting file:", intent.getData(), intent.getData().getPath());
        }
        return null;
    }

    public String readFile(File file) {
        StringBuilder result = new StringBuilder();
        try {
            String line;
            BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(file), "utf-8"));
            while ((line = br.readLine()) != null) {
                result.append(line);
                result.append('\n');
            }
            br.close();
            return result.toString();
        } catch (Exception e) {
            logger.e(e, "Error reading file", file.getAbsolutePath());
            return null;
        }
    }

    public Boolean saveFile(String fileName, String text) {
        try {
            File output = new File(fileName);
            if (!output.exists() || !output.canWrite()) {
                logger.d("Invalid file:", output);
                return false;
            }
            Writer writer = new OutputStreamWriter(new FileOutputStream(output), "utf-8");
            writer.write(text);
            writer.close();
            return true;
        } catch (Exception e) {
            logger.e(e, "Failed to write file:", fileName);
            return false;
        }
    }

    public void copyToClipboard(CharSequence text) {
        ClipData clip = ClipData.newPlainText(text, text);
        getClipboard().setPrimaryClip(clip);
        messageShort("Copied to clipboard");
    }

    private ClipboardManager getClipboard() {
        return (ClipboardManager) context.getSystemService(Context.CLIPBOARD_SERVICE);
    }

    private enum Arch {Arm7, X86};

    private String eabiExecutable() {
        Arch arch = Arch.Arm7;
        String eabi = Build.CPU_ABI;
        if (eabi.equals("x86") || eabi.equals("x86_64")) {
            arch = Arch.X86;
        }
        int rawID = -1;
        switch (arch) {
            case Arm7:
                rawID = R.raw.task_arm7_16;
                break;
            case X86:
                rawID = R.raw.task_x86_16;
                break;
        }
        try {
            File file = new File(context().getFilesDir(), "task");
            InputStream rawStream = context().getResources().openRawResource(rawID);
            FileOutputStream outputStream = new FileOutputStream(file);
            byte[] buffer = new byte[8192];
            int bytes = 0;
            while ((bytes = rawStream.read(buffer)) > 0) {
                outputStream.write(buffer, 0, bytes);
            }
            outputStream.close();
            rawStream.close();
            file.setExecutable(true, true);
            return file.getAbsolutePath();
        } catch (IOException e) {
            logger.e(e, "Error preparing file");
        }
        return null;
    }

    public boolean setDefault(String account) {
        if (!TextUtils.isEmpty(account)) {
            settings().stringSettings(R.string.pref_account_id, account);
            return true;
        }
        return false;
    }

    public List<String> accountFolders() {
        List<String> result = new ArrayList<>();
        File[] files = context().getExternalFilesDir(null).listFiles();
        for (File file : files) {
            if (file.isDirectory() && !file.getName().startsWith(".")) {
                File taskrc = new File(file, AccountController.TASKRC);
                File dataFolder = new File(file, AccountController.DATA_FOLDER);
                if (taskrc.exists() && taskrc.isFile() && dataFolder.exists() && dataFolder.isDirectory()) {
                    // Folder is OK
                    result.add(file.getName());
                }
            }
        }
        return result;
    }

    public String createAccount(String folderName) {
        try {
            if (TextUtils.isEmpty(folderName)) {
                folderName = UUID.randomUUID().toString().toLowerCase();
            }
            File folder = new File(context().getExternalFilesDir(null), folderName);
            if (!folder.exists()) {
                if (!folder.mkdir()) {
                    logger.w("Failed to create folder", folderName);
                    return "Storage access error";
                }
            }
            File taskrc = new File(folder, AccountController.TASKRC);
            if (!taskrc.exists()) {
                FileOutputStream fos = new FileOutputStream(taskrc);
                String[] lines = context.getResources().getStringArray(R.array.default_taskrc);
                for (String line : lines) {
                    fos.write(line.getBytes("utf-8"));
                    fos.write('\n');
                }
                fos.close();
            }
            File dataFolder = new File(folder, AccountController.DATA_FOLDER);
            if (!dataFolder.exists()) {
                if (!dataFolder.mkdir()) {
                    logger.w("Failed to create data folder", dataFolder.getAbsolutePath());
                    return "Storage access error";
                }
            }
            logger.i("Created new profile:", folder);
            return null;
        } catch (Exception e) {
            logger.e(e, "Profile create error:");
            return e.getMessage();
        }
    }

    public String defaultAccount() {
        String id = settings().settingsString(R.string.pref_account_id, "");
        List<String> folders = accountFolders();
        if (folders.contains(id)) return id; // Folder is OK
        if (!folders.isEmpty()) return folders.get(0); // First available
        return null;
    }

    public synchronized AccountController accountController(String id, boolean reload) {
//        logger.d("accountController:", id, reload);
        if (TextUtils.isEmpty(id)) {
            return null; // Will create later
        }
        if (!accountFolders().contains(id)) {
            return null; // Broken folder
        }
        AccountController current = controllerMap.get(id);
        if (null == current || reload) {
            if (null != current) {
                current.stop(); // Cancel all schedules
            }
            controllerMap.put(id, new AccountController(this, id));
        }
        return controllerMap.get(id);
    }
    public synchronized AccountController accountController(FormController form, boolean reload) {
        String id = form.getValue(App.KEY_ACCOUNT);
        return accountController(id, reload);
    }

    public enum NotificationType {
        Sync(1),
        Backup(2);

        private final int id;

        NotificationType(int id) {
            this.id = id;
        }
    }

    public void notify(NotificationType type, String account, NotificationCompat.Builder n) {
        Notification nn = n.build();
        notificationManager.notify(account, type.id, nn);
    }

    public void cancel(NotificationType type, String account) {
        notificationManager.cancel(account, type.id);
    }

    public NotificationCompat.Builder newNotification(String account) {
        NotificationCompat.Builder n = new NotificationCompat.Builder(context);
        n.setContentTitle(account);
        n.setSmallIcon(R.drawable.ic_stat_logo);
        n.setWhen(System.currentTimeMillis());
        return n;
    }

    public Listeners<ToastMessageListener> toastListeners() {
        return toastListeners;
    }

    public void toastMessage(final String message, final boolean showLong) {
        toastListeners.emit(new Listeners.ListenerEmitter<ToastMessageListener>() {
            @Override
            public boolean emit(ToastMessageListener listener) {
                listener.onMessage(message, showLong);
                return false; // One shot
            }
        });
    }

    private static boolean removeFile(File file) {
        if (file.isFile()) {
            return file.delete();
        }
        File[] files = file.listFiles();
        for (File f : files) {
            if (".".equals(f.getName()) || "..".equals(f.getName())) continue;
            boolean result = removeFile(f);
            if (!result) return false;
        }
        return file.delete();
    }

    public boolean removeAccount(String id) {
        AccountController controller = accountController(id, false);
        if (null == controller) {
            return true;
        }
        if (!removeFile(controller.folder())) {
            return false;
        }
        controllerMap.remove(id);
        return true;
    }

    public Listeners<TaskListener> listeners() {
        return taskListeners;
    }
}
