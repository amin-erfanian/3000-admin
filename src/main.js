import { createApp as createVueApp } from 'vue';
import App from '@/App.vue';
import pluginConfigs from '@/constants/general/plugin-configs';
import { registerPlugins } from '@/plugins';
import scrollLock from './directives/v-scroll-lock.js';
import clickOutside from './directives/v-click-outside.js';

const createApplication = () => {
  const vueAppInstance = createVueApp(App);
  registerPlugins(vueAppInstance, pluginConfigs);
  vueAppInstance.directive('scroll-lock', scrollLock);
  vueAppInstance.directive('click-outside', clickOutside);
  vueAppInstance.mount('#app');
};

createApplication();
