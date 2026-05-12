<template>
  <div class="loading-overlay">
    <slot>
      <loading-spinner :name="name" animation-duration="quarter" />
    </slot>
  </div>
</template>

<script setup>
  import loadingSpinner from '@/components/general/loading-spinner.vue';

  defineProps({
    name: {
      type: String,
      default: 'dual-ring',
    },
  });
</script>

<style lang="scss" scoped>
  .loading-overlay {
    --loading-color: var(--palette-primary);

    @include flex(row, nowrap, center, center);
    width: 100%;
    height: 100%;
    background-color: var(--palette-background);
    position: fixed;
    top: 0;
    right: 0;
  }
</style>
