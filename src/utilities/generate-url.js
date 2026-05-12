import baseUrls from '@/constants/common/base/base-urls.constants';

/**
 *
 * @param {string} path
 * @return {string}
 */
export const generateIssuanceUrl = (path) => baseUrls.urls1 + path;

/**
 *
 * @param {string} path
 * @return {string}
 */
export const generateCertificateUrl = (path) => baseUrls.urls2 + path;
