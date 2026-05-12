import axios from 'axios';
import { onRequestFulfilled, onRequestRejected } from './request';
import { onResponseFulfilled, onResponseRejected } from './response';

const TIMEOUT = 2 * 60 * 1000;
import BASE_URL from '@/constants/common/base/base-urls.constants';

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.defaults.errorNotification = {
  show: true,
};

axiosInstance.interceptors.request.use(onRequestFulfilled, onRequestRejected);
axiosInstance.interceptors.response.use(
  onResponseFulfilled,
  onResponseRejected,
);

export default {};
