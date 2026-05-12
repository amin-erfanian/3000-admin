const pluginSourceMap = import.meta.glob('@/plugins/*/index.js', {
  eager: true,
  import: 'default',
});

const pluginSourceList = Object.keys(pluginSourceMap);

export const registerPlugins = (vueInstance, pluginConfigMap = {}) => {
  pluginSourceList.forEach((source) => {
    const plugin = pluginSourceMap[source];
    const [pluginName] = source.split('/').slice(-2);
    const config = pluginConfigMap[pluginName];
    vueInstance.use(plugin, config);
  });
};
