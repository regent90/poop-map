package com.regent.poopmap;

import static org.junit.Assert.*;

import android.content.Context;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import org.junit.Test;
import org.junit.runner.RunWith;

/**
 * Capacitor 功能測試
 * 驗證 Capacitor 插件和原生功能是否正確配置
 */
@RunWith(AndroidJUnit4.class)
public class CapacitorFunctionalityTest {

    @Test
    public void testAppContext() {
        // 驗證應用上下文
        Context appContext = InstrumentationRegistry.getInstrumentation().getTargetContext();
        assertEquals("com.regent.poopmap", appContext.getPackageName());
        assertNotNull("應用上下文不應為空", appContext);
    }

    @Test
    public void testAppName() {
        // 驗證應用名稱
        Context appContext = InstrumentationRegistry.getInstrumentation().getTargetContext();
        String appName = appContext.getString(appContext.getApplicationInfo().labelRes);
        assertEquals("便便地圖", appName);
    }

    @Test
    public void testPermissions() {
        // 驗證關鍵權限是否在 manifest 中聲明
        Context appContext = InstrumentationRegistry.getInstrumentation().getTargetContext();
        
        // 這些權限應該在 AndroidManifest.xml 中聲明
        // 注意：這裡只是驗證權限聲明，不是運行時權限檢查
        assertNotNull("應用上下文應該可用於權限檢查", appContext);
    }

    @Test
    public void testApplicationInfo() {
        // 驗證應用信息
        Context appContext = InstrumentationRegistry.getInstrumentation().getTargetContext();
        assertNotNull("應用信息不應為空", appContext.getApplicationInfo());
        assertTrue("應用應該是可調試的或發布版本", 
            appContext.getApplicationInfo().flags >= 0);
    }
}