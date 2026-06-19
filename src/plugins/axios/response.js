import { toast } from 'vue3-toastify';
import router from '@/router';
import { AXIOS_DEFAULT_ERROR } from '@/constants/common/base/base-error.constants';

export const onResponseFulfilled = (response) => {
  return response.data?.data ?? response?.data;
};

export const onResponseRejected = (error) => {
  const { response, config } = error;

  if (!response) {
    const requestMethod = config?.method;
    const requestUrl = config?.url;

    if (
      requestMethod &&
      requestUrl &&
      !requestUrl.includes('get-info') &&
      (error.message === 'Network Error' || error.code === 'ERR_NETWORK')
    ) {
      toast.error('اتصال به اینترنت برقرار نیست.');
    }

    return Promise.reject(error);
  }

  const { status } = response;
  const { errorNotification } = config || {};

  const messageError =
    response.data?.message?.fa ||
    response.data?.message ||
    AXIOS_DEFAULT_ERROR.fa;

  if (status === 401 || status === 403) {
    localStorage.removeItem('token');
    router.replace('/sign-in');
  }

  if (messageError && errorNotification?.show) {
    toast.error(messageError);
  }

  return Promise.reject(error);
};
