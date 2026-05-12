import { Capacitor } from '@capacitor/core';

export const isTWA = () => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
};

export const isIOSApp = () => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
};

export const isNativeApp = () => {
  return Capacitor.isNativePlatform();
};

export const isPWA = () => {
  if (Capacitor.isNativePlatform()) {
    return false;
  }

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://');

  return isStandalone;
};

export const isWebBrowser = () => {
  return !Capacitor.isNativePlatform() && !isPWA();
};

export const isMobile = () => {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const isAndroid = () => {
  return /Android/i.test(navigator.userAgent);
};

export const isIOS = () => {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const getPlatformInfo = () => {
  return {
    isTWA: isTWA(),
    isIOSApp: isIOSApp(),
    isNativeApp: isNativeApp(),
    isPWA: isPWA(),
    isWebBrowser: isWebBrowser(),
    isMobile: isMobile(),
    isAndroid: isAndroid(),
    isIOS: isIOS(),
    capacitorPlatform: Capacitor.getPlatform(),
    isNativePlatform: Capacitor.isNativePlatform(),
    userAgent: navigator.userAgent,
    displayMode: window.matchMedia('(display-mode: standalone)').matches
      ? 'standalone'
      : window.matchMedia('(display-mode: fullscreen)').matches
      ? 'fullscreen'
      : window.matchMedia('(display-mode: minimal-ui)').matches
      ? 'minimal-ui'
      : 'browser',
    isInstalled: isNativeApp() || isPWA(),
  };
};

export const getPlatformName = () => {
  if (isTWA()) return 'TWA (Android App)';
  if (isIOSApp()) return 'iOS App';
  if (isPWA() && isAndroid()) return 'PWA (Android)';
  if (isPWA() && isIOS()) return 'PWA (iOS)';
  if (isPWA()) return 'PWA (Desktop)';
  if (isWebBrowser() && isMobile()) return 'Mobile Web Browser';
  if (isWebBrowser()) return 'Desktop Web Browser';
  return 'Unknown';
};

export const getCapabilities = () => {
  const native = isNativeApp();

  return {
    localNotifications: native,
    exactAlarms: native && isAndroid(),
    backgroundSync: native,
    fileSystem: native,
    camera: native,
    geolocation: true,
    webPush: !native,
    serviceWorker: !native && 'serviceWorker' in navigator,
    localStorage: true,
    indexedDB: true,
    canInstall: isWebBrowser() && isMobile(),
    isInstalled: native || isPWA(),
  };
};

export const logPlatformInfo = () => {
  const info = getPlatformInfo();
  const capabilities = getCapabilities();

  console.group('🔍 Platform Detection');
  console.log('Platform:', getPlatformName());
  console.log('Details:', info);
  console.log('Capabilities:', capabilities);
  console.groupEnd();
};

export default {
  isTWA,
  isIOSApp,
  isNativeApp,
  isPWA,
  isWebBrowser,
  isMobile,
  isAndroid,
  isIOS,
  getPlatformInfo,
  getPlatformName,
  getCapabilities,
  logPlatformInfo,
};
