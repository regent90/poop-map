// 移動端視窗高度修復工具

/**
 * 設置動態視窗高度
 * 解決移動端瀏覽器地址欄和底部導航欄導致的視窗高度問題
 */
export const setDynamicViewportHeight = () => {
  const setVH = () => {
    // 獲取實際視窗高度
    const vh = window.innerHeight * 0.01;
    // 設置 CSS 自定義屬性
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // 初始設置
  setVH();

  // 監聽視窗大小變化
  window.addEventListener('resize', setVH);
  
  // 監聽方向變化
  window.addEventListener('orientationchange', () => {
    // 延遲執行，等待方向變化完成
    setTimeout(setVH, 100);
  });

  // iOS Safari 特殊處理
  if (isIOSSafari()) {
    // 監聽滾動事件，處理地址欄隱藏/顯示
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setVH();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  // 返回清理函數
  return () => {
    window.removeEventListener('resize', setVH);
    window.removeEventListener('orientationchange', setVH);
  };
};

/**
 * 檢測是否為 iOS Safari
 */
export const isIOSSafari = (): boolean => {
  const userAgent = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
  return isIOS && isSafari;
};

/**
 * 檢測是否為移動設備
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

/**
 * 獲取安全區域信息
 */
export const getSafeAreaInsets = () => {
  const computedStyle = getComputedStyle(document.documentElement);
  
  return {
    top: computedStyle.getPropertyValue('--safe-area-inset-top') || '0px',
    bottom: computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0px',
    left: computedStyle.getPropertyValue('--safe-area-inset-left') || '0px',
    right: computedStyle.getPropertyValue('--safe-area-inset-right') || '0px',
  };
};

/**
 * 設置 viewport meta 標籤
 */
export const setViewportMeta = () => {
  let viewport = document.querySelector('meta[name=viewport]') as HTMLMetaElement;
  
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }
  
  // 設置適合移動端的 viewport
  viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
};

/**
 * 初始化移動端視窗修復
 */
export const initMobileViewportFix = () => {
  // 設置 viewport meta 標籤
  setViewportMeta();
  
  // 設置動態視窗高度
  const cleanup = setDynamicViewportHeight();
  
  // 添加移動端檢測類名
  if (isMobileDevice()) {
    document.documentElement.classList.add('mobile-device');
  }
  
  if (isIOSSafari()) {
    document.documentElement.classList.add('ios-safari');
  }
  
  return cleanup;
};