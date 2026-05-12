const ENVIRONMENT = import.meta.env.VITE_APP_MODE;

const BASE_URL_MAPPER = {
  dev: '/api',
};

export default BASE_URL_MAPPER[ENVIRONMENT];
