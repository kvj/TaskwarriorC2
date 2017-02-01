package com.taskwc2.controller.data;

import android.annotation.TargetApi;
import android.os.Build;
import android.os.Environment;

import com.taskwc2.App;

import org.kvj.bravo7.util.Compat;

import java.io.File;
import java.io.FileFilter;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Created by vorobyev on 1/31/17.
 */

public class ProfileArchiver {

    static SimpleDateFormat dateFormat = new SimpleDateFormat("yyMMddHHmmss");

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
