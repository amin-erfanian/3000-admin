const ROUTES = [
  {
    name: 'sign-in',
    path: '/sign-in',
    component: () => import('@/views/auth/sign-in-view.vue'),
    meta: {
      layout: 'auth',
      title: 'ورود',
    },
  },
  {
    name: 'dashboard',
    path: '/',
    component: () => import('@/views/dashboard/index.vue'),
    meta: {
      layout: 'main',
      title: 'داشبورد',
      authRequired: true,
    },
  },
  {
    name: 'products',
    path: '/products',
    component: () => import('@/views/products/index.vue'),
    meta: {
      layout: 'main',
      title: 'مدیریت کالا',
      authRequired: true,
    },
  },
  // {
  //   name: 'orders',
  //   path: '/orders',
  //   component: () => import('@/views/orders/index.vue'),
  //   meta: {
  //     layout: 'main',
  //     title: 'سفارشات',
  //     authRequired: true,
  //   },
  // },
  // {
  //   name: 'sellers',
  //   path: '/sellers',
  //   component: () => import('@/views/sellers/index.vue'),
  //   meta: {
  //     layout: 'main',
  //     title: 'فروشندگان',
  //     authRequired: true,
  //   },
  // },
  // {
  //   name: 'reports',
  //   path: '/reports',
  //   component: () => import('@/views/reports/index.vue'),
  //   meta: {
  //     layout: 'main',
  //     title: 'گزارشات',
  //     authRequired: true,
  //   },
  // },
];

export default ROUTES;
