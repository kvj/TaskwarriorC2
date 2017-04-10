package com.taskwc2.controller.data;

import android.annotation.TargetApi;
import android.os.Build;
import android.os.Environment;
import android.text.TextUtils;

import com.taskwc2.App;

import org.kvj.bravo7.util.Compat;

import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

/**
 * Created by vorobyev on 1/31/17.
 */

public class ProfileArchiver {

    static SimpleDateFormat dateFormat = new SimpleDateFormat("yyMMddHHmmss");
    static Pattern filePattern = Pattern.compile("^([\\da-fA-F\\-]{36})\\.\\d+\\.taskw\\.zip$");

    private static ZipEntry findFile(ZipInputStream zis, String name) throws IOException {
        do {
            ZipEntry ze = zis.getNextEntry();
            if (null == ze) { // Not found
                return null;
            }
            if (name.equals(ze.getName())) { // Found
                return ze;
            }
            zis.closeEntry(); // Go to next
        } while (true);
    }

    public static String restoreArchivedProfile(Controller controller, String fileUri) throws IOException {
        // Check file name correctness
        File zip = new File(URI.create(fileUri));
        if (!zip.exists() || !zip.canRead() || !zip.isFile()) { // Invalid
            throw new IOException("Invalid zip archive");
        }
        Matcher m = filePattern.matcher(zip.getName());
        if (!m.find()) { // Invalid name
            throw new IOException("Invalid file name");
        }
        String id = UUID.fromString(m.group(1)).toString().toLowerCase();
        // Open as zip
        ZipInputStream zis = new ZipInputStream(new FileInputStream(zip));
        // Make folder if not exist
        AccountController ac = controller.accountController(id, false);
        if (null == ac) { // Create new
            String err = controller.createAccount(id);
            if (null != err) { // Failed
                zis.close();
                throw new IOException(err);
            }
            ac = controller.accountController(id, true);
        }
        // Add files and folders
        while (true) {
            ZipEntry ze = zis.getNextEntry();
            if (ze == null) { // EOF
                break;
            }
            File outp = new File(ac.folder(), ze.getName());
            if (ze.isDirectory()) { // Make folder
                if (!outp.exists() && !outp.mkdirs()) { // Failed to make folder
                    zis.close();
                    throw new IOException(String.format("Failed to make folder: %s", ze.getName()));
                }
            } else {
                // Copy file
                FileOutputStream fos = new FileOutputStream(outp);
                copyStream(zis, fos);
                fos.close();
            }
            zis.closeEntry();
        }
        zis.close();
        // Return ID on success
        return id;
    }

    public static File archiveProfile(AccountController controller)
        throws IOException {
        File publicFolder = Compat.produceLevelAware(Build.VERSION_CODES.KITKAT, new Compat.Producer<File>() {
            @TargetApi(Build.VERSION_CODES.KITKAT)
            @Override
            public File produce() {
                return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS);
            }
        }, new Compat.Producer<File>() {
            @Override
            public File produce() {
                return Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
            }
        });
        if (null == publicFolder) {
            throw new IOException("Public folder not ready");
        }
        File archiveFolder = new File(publicFolder, App.FOLDER_NAME);
        if (!archiveFolder.exists()) {
            if (!archiveFolder.mkdirs()) {
                throw new IOException("Public folder I/O error");
            }
        }
        String fileName = String.format("%s.%s.taskw.zip", controller.id(), dateFormat.format(new Date()));
        File output = new File(archiveFolder, fileName);
        FileOutputStream fos = new FileOutputStream(output);
        ZipOutputStream zos = new ZipOutputStream(fos);
        copyFile(controller.taskrc(), zos, AccountController.TASKRC);
        if (!controller.dataLocationSet) {
            // Add all files
            File[] dataFiles = controller.dataFolder().listFiles(new FileFilter() {
                @Override
                public boolean accept(File pathname) {
                    if (!pathname.isFile())
                        return false;
                    if (!pathname.getName().endsWith(".data"))
                        return false;
                    return true;
                }
            });
            for (File dataFile : dataFiles) {
                copyFile(dataFile, zos, String.format("%s/%s", "data", dataFile.getName()));
            }
            final Map<String, String> config = controller.taskSettings(false, "taskd.ca", "taskd.certificate", "taskd.key");
            for (String value : config.values()) { // Store any local .pem file
                if (!TextUtils.isEmpty(value) && !value.startsWith("/") && !value.startsWith("../")) {
                    // Local file - add to zip
                    File file = controller.fileFromConfig(value);
                    if (null != file && file.exists()) { // Accessible
                        copyFile(file, zos, value);
                    }
                }
            }
        }
        zos.close();
        fos.close();
        return output;
    }

    private static void copyFile(File input, ZipOutputStream zos, String entryName) throws IOException {
        ZipEntry entry = new ZipEntry(entryName);
        zos.putNextEntry(entry);
        FileInputStream fis = new FileInputStream(input);
        copyStream(fis, zos);
        fis.close();
        zos.closeEntry();
    }

    private static void copyStream(InputStream input, OutputStream output) throws IOException {
        byte[] buffer = new byte[1024];
        int bytesRead;
        while ((bytesRead = input.read(buffer)) > 0) {
            output.write(buffer, 0, bytesRead);
        }
    }
}
