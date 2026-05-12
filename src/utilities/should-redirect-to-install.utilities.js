import { isMobile, isTWA, isPWA } from './platform-detection.utilities';

export const shouldRedirectToInstall = () => {
  try {
    return isMobile() && !isTWA() && !isPWA();
  } catch (e) {
    return false;
  }
};
