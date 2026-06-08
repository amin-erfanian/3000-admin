import useAdminStore from '@/stores/admin';
const AUTH_ROUTES = ['sign-in'];

const beforeEach = (to) => {
  const adminStore = useAdminStore();

  const hasToken = !!localStorage.getItem('token');

  if (!hasToken) adminStore.logout();

  if (hasToken && AUTH_ROUTES.includes(to.name)) {
    return { path: '/' };
  }

  return true;
};

const afterEach = () => {};

const _init = (router) => {
  router.afterEach(afterEach);
  router.beforeEach(beforeEach);
};

export default _init;
