<template>
  <component :is="iconComponent" v-bind="attrs" />
</template>

<script setup>
  import { defineAsyncComponent, useAttrs } from 'vue';

  const props = defineProps({
    iconName: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      default: '',
    },
  });
  const icons = import.meta.glob('@/components/common/icons/**/*.vue');

  const BASE_ICONS_PATH = '/src/components/common/icons';
  const loadIcon = async (path, iconName) => {
    const componentPath = `${BASE_ICONS_PATH}${path}/${iconName}.icon.vue`;

    if (icons[componentPath]) {
      return icons[componentPath]();
    } else {
      throw new Error(`Icon ${iconName} not found at path ${path}`);
    }
  };

  const iconComponent = defineAsyncComponent(() =>
    Promise.resolve(loadIcon(props.path, props.iconName)),
  );

  const attrs = useAttrs();
</script>
