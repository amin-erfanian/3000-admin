export const onRequestFulfilled = (config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
};

export const onRequestRejected = (error) => {
  return Promise.reject(error);
};
