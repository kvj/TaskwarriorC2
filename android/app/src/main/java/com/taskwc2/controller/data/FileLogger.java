package com.taskwc2.controller.data;

import android.os.Build;

import com.taskwc2.App;
import com.taskwc2.BuildConfig;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.io.Writer;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by kvorobyev on 4/2/16.
 */
public class FileLogger {

    private final File file;
    private SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm:ss");

    public FileLogger(File folder) {
        this.file = new File(folder, App.LOG_FILE);
        reset();
    }

    private void reset() {
        write(false, new Object[] {new Date(), "Ready to log"});
        log("Device is:", Build.BRAND, Build.MODEL, Build.CPU_ABI, Build.VERSION.SDK_INT);
        log("Application is:", BuildConfig.VERSION_NAME, BuildConfig.VERSION_CODE);
    }

    public void log(Object... params) {
        write(true, params);
    }

    private synchronized void write(boolean append, Object[] params) {
        Writer stream = null;
        try { // Open, write, close
            stream = new OutputStreamWriter(new FileOutputStream(file, append), "utf-8");
            if (params.length == 1 && params[0] instanceof Throwable) { // Exception
                Throwable t = (Throwable) params[0];
                PrintWriter ps = new PrintWriter(stream);
                t.printStackTrace(ps);
                ps.write('\n');
                return;
            }
            StringBuilder sb = new StringBuilder();
            sb.append(timeFormat.format(new Date()));
            sb.append(":");
            for (Object obj : params) { // $COMMENT
                sb.append(" ");
                if (null == obj) { // NULL
                    sb.append("<NULL>");
                    continue;
                }
                if ("".equals(obj)) { // Empty string
                    sb.append("<Empty>");
                    continue;
                }
                sb.append(obj.toString());
            }
            sb.append("\n");
            stream.write(sb.toString());
        } catch (Throwable t) { // IO error
            t.printStackTrace();
        } finally {
            try {
                if (null != stream) { // Opened - close
                    stream.close();
                }
            } catch (Throwable t) {}
        }
    }

    public String logFile(File f) {
        StringBuilder sb = new StringBuilder();
        sb.append(f.getAbsolutePath());
        sb.append(", exist: ");
        sb.append(f.exists());
        sb.append(", isFile: ");
        sb.append(f.isFile());
        sb.append(", isFolder: ");
        sb.append(f.isDirectory());
        if (f.exists()) { // More
            sb.append(", canRead: ");
            sb.append(f.canRead());
            sb.append(", canWrite: ");
            sb.append(f.canWrite());
            sb.append(", size: ");
            sb.append(f.length());
        }
        return sb.toString();
    }

    public File file() {
        return file;
    }
}
