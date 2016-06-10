package com.taskwc2.controller.data;

import android.app.PendingIntent;
import android.content.Intent;
import android.net.LocalServerSocket;
import android.net.LocalSocket;
import android.net.Uri;
import android.support.v4.app.NotificationCompat;
import android.text.TextUtils;

import com.taskwc2.App;
import com.taskwc2.MainActivity;
import com.taskwc2.R;
import com.taskwc2.controller.sync.SSLHelper;

import org.kvj.bravo7.log.Logger;
import org.kvj.bravo7.util.Compat;
import org.kvj.bravo7.util.DataUtil;
import org.kvj.bravo7.util.Listeners;
import org.kvj.bravo7.util.Tasks;

import java.io.CharArrayWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.Reader;
import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.net.ssl.SSLSocket;
import javax.net.ssl.SSLSocketFactory;


/**
 * Created by vorobyev on 11/17/15.
 */
public class AccountController {

    private static final Pattern QUESTION_PARSE = Pattern.compile("^(.+\\?)\\s\\((\\S+)\\)\\s*$");

    public void scheduleSync(int seconds) {
        if (seconds <= 0) {
            logger.w("Ignore schedule - not configured", seconds);
            return;
        }
        if (null == syncSocket) { // Have socket opened - add key
            logger.w("Sync is not configured");
            return;
        }
        Calendar c = Calendar.getInstance();
        c.add(Calendar.SECOND, seconds);
        controller.scheduleAlarm(c.getTime(), syncIntent("alarm"));
        logger.d("Scheduled:", c.getTime(), socketName);
    }

    public void rememberTimers(int normal, int error) {
        controller.settings().intSettings(R.string.pref_sync_normal, normal);
        controller.settings().intSettings(R.string.pref_sync_error, error);
    }

    public interface TaskListener {
        public void onQuestion(String question, DataUtil.Callback<Integer> callback, List<String> answers);
    }

    private Listeners<TaskListener> taskListeners = new Listeners<TaskListener>();
    private Thread acceptThread = null;
    private final String accountName;
    private Set<NotificationType> notificationTypes = new HashSet<>();

    FileLogger fileLogger = null;

    public File taskrc() {
        return new File(tasksFolder, TASKRC);
    }

    public String name() {
        return accountName;
    }

    public String id() {
        return id;
    }

    public boolean debugEnabled() {
        return fileLogger != null;
    }

    public FileLogger debugLogger() {
        return fileLogger;
    }

    public static final String TASKRC = ".taskrc.android";
    public static final String DATA_FOLDER = "data";
    private final Controller controller;
    private final String id;
    private boolean active = false;
    private final String socketName;

    Logger logger = Logger.forInstance(this);

    private final LocalServerSocket syncSocket;
    private final File tasksFolder;

    public interface StreamConsumer {
        public void eat(String line);
    }

    private class ToLogConsumer implements StreamConsumer {

        private final Logger.LoggerLevel level;
        private final String prefix;

        private ToLogConsumer(Logger.LoggerLevel level, String prefix) {
            this.level = level;
            this.prefix = prefix;
        }

        @Override
        public void eat(String line) {
            logger.log(level, prefix, line);
        }
    }

    private StreamConsumer errConsumer = new ToLogConsumer(Logger.LoggerLevel.Warning, "ERR:");
    private StreamConsumer outConsumer = new ToLogConsumer(Logger.LoggerLevel.Info, "STD:");

    public AccountController(Controller controller, String folder) {
        this.controller = controller;
        this.id = folder;
        this.accountName = folder;
        tasksFolder = initTasksFolder();
        socketName = UUID.randomUUID().toString().toLowerCase();
        initLogger();
        syncSocket = openLocalSocket(socketName);
        scheduleSync(TimerType.Periodical); // Schedule on start
        loadNotificationTypes();
    }

    private void initLogger() {
        fileLogger = null;
        Map<String, String> conf = taskSettings(androidConf("debug"));
        if ("y".equalsIgnoreCase(conf.get("android.debug"))) { // Enabled
            fileLogger = new FileLogger(tasksFolder);
            debug("Profile:", accountName, id, fileLogger.logFile(tasksFolder));
        }
    }

    private void debug(Object... params) {
        if (null != fileLogger) { // Enabled
            fileLogger.log(params);
        }
    }

    private void loadNotificationTypes() {
        new Tasks.SimpleTask<String>() {

            @Override
            protected String doInBackground() {
                Map<String, String> config = taskSettings(androidConf("sync.notification"));
                if (config.isEmpty()) {
                    return "all";
                }
                return config.values().iterator().next();
            }

            @Override
            protected void onPostExecute(String s) {
                notificationTypes.clear();
                if ("all".equals(s)) { // All types
                    notificationTypes.add(NotificationType.Sync);
                    notificationTypes.add(NotificationType.Success);
                    notificationTypes.add(NotificationType.Error);
                    return;
                }
                for (String type : s.split(",")) { // Search type
                    for (NotificationType nt : NotificationType.values()) { // Check name
                        if (nt.name.equalsIgnoreCase(type.trim())) { // Found
                            notificationTypes.add(nt);
                            break;
                        }
                    }
                }
            }
        }.exec();
    }

    private class StringAggregator implements StreamConsumer {

        StringBuilder builder = new StringBuilder();

        @Override
        public void eat(String line) {
            if (builder.length() > 0) {
                builder.append('\n');
            }
            builder.append(line);
        }

        private String text() {
            return builder.toString();
        }
    }

    public enum TimerType {
        Periodical(R.string.pref_sync_normal),
        AfterError(R.string.pref_sync_error);
//        AfterChange("onchange");

        private final int type;

        TimerType(int type) {
            this.type = type;
        }
    }

    public enum NotificationType {Sync("sync"), Success("success"), Error("error");

        private final String name;

        NotificationType(String name) {
            this.name = name;
        }
    }

    public void stop() {
        controller.cancelAlarm(syncIntent("alarm"));
        if (null != syncSocket) {
            try {
                syncSocket.close();
            } catch (Exception e) {
                logger.w(e, "Failed to close socket");
            }
        }
    }

    public void scheduleSync(final TimerType type) {
        int normal = controller.settings().settingsInt(TimerType.Periodical.type, 0);
        int seconds = controller.settings().settingsInt(type.type, normal);
        scheduleSync(seconds);
    }

    private String androidConf(String format) {
        return String.format("android.%s", format);
    }

    private boolean toggleSyncNotification(NotificationCompat.Builder n, NotificationType type) {
        if (notificationTypes.contains(type)) { // Have to show
            Intent intent = new Intent(controller.context(), MainActivity.class);
            intent.putExtra(App.KEY_ACCOUNT, id);
            n.setContentIntent(PendingIntent.getActivity(controller.context(), 0, intent, PendingIntent.FLAG_UPDATE_CURRENT));
            controller.notify(Controller.NotificationType.Sync, accountName, n);
            return true;
        } else {
            controller.cancel(Controller.NotificationType.Sync, accountName);
            return false;
        }
    }

    public String taskSync() {
        NotificationCompat.Builder n = controller.newNotification(accountName);
        n.setOngoing(true);
        n.setContentText("Sync is in progress");
        n.setTicker("Sync is in progress");
        n.setPriority(NotificationCompat.PRIORITY_DEFAULT);
        toggleSyncNotification(n, NotificationType.Sync);
        StringAggregator err = new StringAggregator();
        StringAggregator out = new StringAggregator();
        boolean result = callTask(out, err, "sync");
        debug("Sync result:", result);
        logger.d("Sync result:", result, "ERR:", err.text(), "OUT:", out.text());
        n = controller.newNotification(accountName);
        n.setOngoing(false);
        if (result) { // Success
            n.setContentText("Sync complete");
            n.setPriority(NotificationCompat.PRIORITY_MIN);
//            n.addAction(R.drawable.ic_action_sync, "Sync again", syncIntent("notification"));
            toggleSyncNotification(n, NotificationType.Success);
            scheduleSync(TimerType.Periodical);
            return null;
        } else {
            String error = err.text();
            debug("Sync error output:", error);
            n.setContentText("Sync failed");
            n.setTicker("Sync failed");
            n.setSubText(error);
            n.setVisibility(NotificationCompat.VISIBILITY_PUBLIC);
            n.setPriority(NotificationCompat.PRIORITY_DEFAULT);
//            n.addAction(R.drawable.ic_action_sync, "Retry now", syncIntent("notification"));
            toggleSyncNotification(n, NotificationType.Error);
            scheduleSync(TimerType.AfterError);
            return error;
        }
    }

    Pattern linePatthern = Pattern.compile("^([A-Za-z0-9\\._]+)\\s+(\\S.*)$");

    private String taskSetting(String name) {
        return taskSettings(name).get(name);
    }

    private Map<String, String> taskSettings(final String... names) {
        final Map<String, String> result = new LinkedHashMap<>();
        callTask(new StreamConsumer() {
            @Override
            public void eat(String line) {
                Matcher m = linePatthern.matcher(line);
                if (m.find()) {
                    String keyName = m.group(1).trim();
                    String keyValue = m.group(2).trim();
                    for (String name : names) {
                        if (name.equalsIgnoreCase(keyName)) {
                            result.put(name, keyValue);
                            break;
                        }
                    }
                }
            }
        }, errConsumer, "rc.defaultwidth=1000", "show");
        return result;
    }

    private Thread readStream(InputStream stream, final OutputStream outputStream,
                              final StreamConsumer consumer) {
        final Reader reader;
        try {
            reader = new InputStreamReader(stream, "utf-8");
        } catch (UnsupportedEncodingException e) {
            logger.e("Error opening stream");
            return null;
        }
        Thread thread = new Thread() {
            @Override
            public void run() {
                final DataUtil.Callback<String> questionAnswer = new DataUtil.Callback<String>() {
                    @Override
                    public boolean call(String value) {
                        logger.d("Answer:", value);
                        try {
                            outputStream.write(String.format("%s\n", value).getBytes("utf-8"));
                        } catch (IOException e) {
                            e.printStackTrace();
                            return false;
                        }
                        return true;
                    }
                };

                try {
                    CharArrayWriter line = new CharArrayWriter();
                    int ch;
                    while ((ch = reader.read()) >= 0) {
                        if (ch == '\n') {
                            // New line
                            if (null != consumer) {
                                consumer.eat(line.toString());
                                line.reset();
                            }
                            continue;
                        }
                        line.write(ch);
                        if (null != outputStream) {
                            final Matcher m = QUESTION_PARSE.matcher(line.toString());
                            if (m.find()) {
                                // Ask
                                final List<String> choices = new ArrayList<>();
                                Collections.addAll(choices, m.group(2).split("/"));
                                logger.d("Question:", m.group(1), choices, line);
                                final DataUtil.Callback<Integer> cb = new DataUtil.Callback<Integer>() {
                                    @Override
                                    public boolean call(Integer value) {
                                        questionAnswer.call(choices.get(value));
                                        return true;
                                    }
                                };
                                boolean ignored =
                                    taskListeners.emit(new Listeners.ListenerEmitter<TaskListener>() {
                                    @Override
                                    public boolean emit(TaskListener listener) {
                                        listener.onQuestion(m.group(1), cb, choices);
                                        return false;
                                    }
                                });
                                if (ignored) {
                                    questionAnswer.call(choices.get(choices.size()-1)); // Last answer
                                }
                            }
                        }
                    }
                    if (line.size() > 0) {
                        // Last line
                        if (null != consumer) {
                            consumer.eat(line.toString());
                        }
                    }
                } catch (Exception e) {
                    logger.e(e, "Error reading stream");
                } finally {
                    try {
                        reader.close();
                    } catch (IOException e) {
                    }
                }
            }
        };
        thread.start();
        return thread;
    }

    private File initTasksFolder() {
        File folder = new File(controller.context().getExternalFilesDir(null), id);
        if (!folder.exists() || !folder.isDirectory()) {
            return null;
        }
        return folder;
    }

    public int callTask(StreamConsumer out, StreamConsumer err, StreamConsumer question, boolean api, String... arguments) {
        active = true;
        try {
            if (null == controller.executable) {
                debug("Error in binary call: executable not found");
                throw new RuntimeException("Invalid executable");
            }
            if (null == tasksFolder) {
                debug("Error in binary call: invalid profile folder");
                throw new RuntimeException("Invalid folder");
            }
            List<String> args = new ArrayList<>();
            args.add(controller.executable);
            if (null != syncSocket) { // Have socket opened - add key
                args.add("rc.taskd.socket=" + socketName);
            }
            if (api) {
                args.add("rc.color=off");
                args.add("rc.confirmation=off");
                args.add("rc.verbose=nothing");
            }
            Collections.addAll(args, arguments);
            ProcessBuilder pb = new ProcessBuilder(args);
            pb.directory(tasksFolder);
            pb.environment().put("TASKRC", new File(tasksFolder, TASKRC).getAbsolutePath());
            pb.environment().put("TASKDATA", new File(tasksFolder, DATA_FOLDER).getAbsolutePath());
            Process p = pb.start();
            logger.d("Calling now:", tasksFolder, args);
//            debug("Execute:", args);
            Thread outThread = readStream(p.getInputStream(), p.getOutputStream(), out);
            Thread errThread = readStream(p.getErrorStream(), null, err);
            int exitCode = p.waitFor();
            logger.d("Exit code:", exitCode, args);
//            debug("Execute result:", exitCode);
            if (null != outThread) outThread.join();
            if (null != errThread) errThread.join();
            return exitCode;
        } catch (Exception e) {
            logger.e(e, "Failed to execute task");
            err.eat(e.getMessage());
            debug("Execute failure:");
            debug(e);
            return 255;
        } finally {
            active = false;
        }
    }

    private boolean callTask(StreamConsumer out, StreamConsumer err, String... arguments) {
        int result = callTask(out, err, null, true, arguments);
        return result == 0;
    }

    private File fileFromConfig(String path) {
        if (TextUtils.isEmpty(path)) { // Invalid path
            return null;
        }
        if (path.startsWith("/")) { // Absolute
            return new File(path);
        }
        // Relative
        return new File(this.tasksFolder, path);
    }

    private class LocalSocketRunner {

        private final int port;
        private final String host;
        private final SSLSocketFactory factory;
        private final LocalServerSocket socket;

        private LocalSocketRunner(String name, Map<String, String> config) throws Exception {
            SSLHelper.TrustType trustType = SSLHelper.parseTrustType(config.get("taskd.trust"));
            String _host = config.get("taskd.server");
            int lastColon = _host.lastIndexOf(":");
            this.port = Integer.parseInt(_host.substring(lastColon + 1));
            this.host = _host.substring(0, lastColon);
            debug("Host and port:", host, port);
            if (null != fileLogger) { // Can't just call debug, because of use of fileLogger
                debug("CA file:",
                        fileLogger.logFile(fileFromConfig(config.get("taskd.ca"))));
                debug("Certificate file:",
                        fileLogger.logFile(fileFromConfig(config.get("taskd.certificate"))));
                debug("Key file:",
                        fileLogger.logFile(fileFromConfig(config.get("taskd.key"))));
            }
            this.factory = SSLHelper.tlsSocket(
                    new FileInputStream(fileFromConfig(config.get("taskd.ca"))),
                    new FileInputStream(fileFromConfig(config.get("taskd.certificate"))),
                    new FileInputStream(fileFromConfig(config.get("taskd.key"))), trustType);
            debug("Credentials loaded");
            logger.d("Connecting to:", this.host, this.port);
            this.socket = new LocalServerSocket(name);
        }

        public void accept() throws IOException {
            LocalSocket conn = socket.accept();
            logger.d("New incoming connection");
            new LocalSocketThread(conn).start();
        }

        private class LocalSocketThread extends Thread {

            private final LocalSocket socket;

            private LocalSocketThread(LocalSocket socket) {
                this.socket = socket;
            }

            private long recvSend(InputStream from, OutputStream to) throws IOException {
                byte[] head = new byte[4]; // Read it first
                from.read(head);
                to.write(head);
                to.flush();
                long size = ByteBuffer.wrap(head, 0, 4).order(ByteOrder.BIG_ENDIAN).getInt();
                long bytes = 4;
                byte[] buffer = new byte[1024];
                logger.d("Will transfer:", size);
                while (bytes < size) {
                    int recv = from.read(buffer);
//                logger.d("Actually get:", recv);
                    if (recv == -1) {
                        return bytes;
                    }
                    to.write(buffer, 0, recv);
                    to.flush();
                    bytes += recv;
                }
                logger.d("Transfer done", bytes, size);
                return bytes;
            }

            @Override
            public void run() {
                SSLSocket remoteSocket = null;
                debug("Communication taskw<->android started");
                try {
                    remoteSocket = (SSLSocket) factory.createSocket(host, port);
                    final SSLSocket finalRemoteSocket = remoteSocket;
                    Compat.levelAware(16, new Runnable() {
                        @Override
                        public void run() {
                            finalRemoteSocket.setEnabledProtocols(new String[]{"TLSv1", "TLSv1.1", "TLSv1.2"});
                        }
                    }, new Runnable() {
                        @Override
                        public void run() {
                            finalRemoteSocket.setEnabledProtocols(new String[]{"TLSv1"});
                        }
                    });
                    debug("Ready to establish TLS connection to:", host, port);
                    InputStream localInput = socket.getInputStream();
                    OutputStream localOutput = socket.getOutputStream();
                    InputStream remoteInput = remoteSocket.getInputStream();
                    OutputStream remoteOutput = remoteSocket.getOutputStream();
                    debug("Connected to taskd server");
                    logger.d("Connected, will read first piece", remoteSocket.getSession().getCipherSuite());
                    long bread = recvSend(localInput, remoteOutput);
                    long bwrite = recvSend(remoteInput, localOutput);
                    logger.d("Sync success");
                    debug("Transfer complete. Bytes sent:", bread, "Bytes received:", bwrite);
                } catch (Exception e) {
                    logger.e(e, "Failed to transfer data");
                    debug("Transfer failure");
                    debug(e);
                } finally {
                    if (null != remoteSocket) {
                        try {
                            remoteSocket.close();
                        } catch (IOException e) {
                        }
                    }
                    try {
                        socket.close();
                    } catch (IOException e) {
                    }
                }
            }
        }
    }


    private LocalServerSocket openLocalSocket(String name) {
        try {
            final Map<String, String> config = taskSettings("taskd.ca", "taskd.certificate", "taskd.key", "taskd.server", "taskd.trust");
            logger.d("Will run with config:", config);
            debug("taskd.* config:", config);
            if (!config.containsKey("taskd.server")) {
                // Not configured
                logger.d("Sync not configured - give up");
                controller.toastMessage("Sync disabled: no taskd.server value", true);
                debug("taskd.server is empty: sync disabled");
                return null;
            }
            final LocalSocketRunner runner;
            try {
                runner = new LocalSocketRunner(name, config);
            } catch (Exception e) {
                logger.e(e, "Error opening socket");
                debug(e);
                controller.toastMessage("Sync disabled: certificate load failure", true);
                return null;
            }
            acceptThread = new Thread() {
                @Override
                public void run() {
                    while (true) {
                        try {
//                            debug("Incoming connection: task binary -> android");
                            runner.accept();
                        } catch (IOException e) {
                            debug("Socket accept failed");
                            debug(e);
                            logger.w(e, "Accept failed");
                            return;
                        }
                    }
                }
            };
            acceptThread.start();
            controller.toastMessage("Sync configured", false);
            return runner.socket; // Close me later on stop
        } catch (Exception e) {
            logger.e(e, "Failed to open local socket");
        }
        return null;
    }

    public PendingIntent syncIntent(String type) {
        Intent intent = new Intent(controller.context(), SyncIntentReceiver.class);
        intent.putExtra(App.KEY_ACCOUNT, id);
        intent.setData(Uri.fromParts("tw", type, id));
        return PendingIntent.getBroadcast(controller.context(), App.SYNC_REQUEST, intent, PendingIntent.FLAG_CANCEL_CURRENT);
    }
}
