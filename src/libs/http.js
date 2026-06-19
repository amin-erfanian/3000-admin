import { Capacitor, CapacitorHttp } from '@capacitor/core';
import axios from 'axios';
import { toast } from 'vue3-toastify';
import router from '@/router';
import { AXIOS_DEFAULT_ERROR } from '@/constants/common/base/base-error.constants';
import BASE_URL from '@/constants/common/base/base-urls.constants';

const TIMEOUT = 2 * 60 * 1000;

class HttpService {
  constructor() {
    this.baseURL = BASE_URL;
    this.timeout = TIMEOUT;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Initialize axios instance for web
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: this.defaultHeaders,
    });

    this.axiosInstance.defaults.errorNotification = { show: true };
    this.setupAxiosInterceptors();
  }

  setupAxiosInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        // Only add Authorization header if token exists and is valid
        if (token && token !== 'null' && token !== 'undefined') {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response.data?.data ?? response?.data,
      (error) => this.handleAxiosError(error),
    );
  }

  async handleAxiosError(error) {
    if (!error.response) {
      const requestMethod = error.config?.method;
      const requestUrl = error.config?.url;

      if (requestMethod && requestUrl && !requestUrl.indexOf('get-info')) {
        if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
          toast.error('اتصال به اینترنت برقرار نیست.');
        }
      }
    }

    const { config, response } = error;
    const { status } = response;
    const { errorNotification } = config;
    const messageError =
      response?.data?.message?.fa ||
      response?.data?.message ||
      AXIOS_DEFAULT_ERROR.fa;

    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      router.replace('/sign-in');
    }

    if (messageError && errorNotification?.show) {
      toast.error(messageError);
    }

    return Promise.reject(error.response);
  }

  getAuthHeaders() {
    const headers = { ...this.defaultHeaders };
    const token = localStorage.getItem('token');

    // Only add Authorization header if token exists and is valid
    if (token && token !== 'null' && token !== 'undefined') {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  getFullUrl(url) {
    return url.startsWith('http') ? url : `${this.baseURL}${url}`;
  }

  async handleCapacitorError(error, config = {}) {
    const { errorNotification = { show: true } } = config;

    if (error.status === 401 || status === 403) {
      localStorage.removeItem('token');
      router.replace('/sign-in');
    }

    if (!error.data && error.status === 0) {
      toast.error('اتصال به اینترنت برقرار نیست.');
    }

    const messageError =
      error.data?.message?.fa || error.data?.message || AXIOS_DEFAULT_ERROR.fa;

    if (messageError && errorNotification?.show) {
      toast.error(messageError);
    }

    throw error;
  }

  async request(method, url, options = {}) {
    const {
      data,
      params,
      headers = {},
      errorNotification,
      ...otherOptions
    } = options;
    const fullUrl = this.getFullUrl(url);

    if (Capacitor.isNativePlatform()) {
      // Use Capacitor HTTP for native apps
      try {
        const requestHeaders = { ...this.getAuthHeaders(), ...headers };

        const capacitorOptions = {
          url: fullUrl,
          headers: requestHeaders,
          connectTimeout: this.timeout,
          readTimeout: this.timeout,
          ...otherOptions,
        };

        if (data) capacitorOptions.data = data;
        if (params) capacitorOptions.params = params;

        let response;
        switch (method.toUpperCase()) {
          case 'GET':
            response = await CapacitorHttp.get(capacitorOptions);
            break;
          case 'POST':
            response = await CapacitorHttp.post(capacitorOptions);
            break;
          case 'PUT':
            response = await CapacitorHttp.put(capacitorOptions);
            break;
          case 'PATCH':
            response = await CapacitorHttp.patch(capacitorOptions);
            break;
          case 'DELETE':
            response = await CapacitorHttp.delete(capacitorOptions);
            break;
          default:
            response = await CapacitorHttp.request({
              ...capacitorOptions,
              method: method.toUpperCase(),
            });
        }

        // CapacitorHttp doesn't throw errors for HTTP error status codes
        // Check status and throw if it's an error status
        if (response.status < 200 || response.status >= 300) {
          throw {
            status: response.status,
            data: response.data,
            url: fullUrl,
            method: method.toUpperCase(),
          };
        }

        // Return data in the same format as axios
        return response.data?.data ?? response.data;
      } catch (error) {
        await this.handleCapacitorError(error, { errorNotification });
      }
    } else {
      // Use axios for PWA/web
      const config = {
        method,
        url,
        headers,
        errorNotification,
        ...otherOptions,
      };

      if (data) config.data = data;
      if (params) config.params = params;

      return await this.axiosInstance.request(config);
    }
  }

  async get(url, options = {}) {
    return this.request('GET', url, options);
  }

  async post(url, data, options = {}) {
    return this.request('POST', url, { ...options, data });
  }

  async put(url, data, options = {}) {
    return this.request('PUT', url, { ...options, data });
  }

  async patch(url, data, options = {}) {
    return this.request('PATCH', url, { ...options, data });
  }

  async delete(url, options = {}) {
    return this.request('DELETE', url, options);
  }

  // Direct access to axios instance for web-only features
  get axios() {
    return this.axiosInstance;
  }
}

export const httpService = new HttpService();
export default httpService;
