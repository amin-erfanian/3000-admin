<template>
  <div class="main-layout">
    <HeaderComponent />
    <div class="main-layout__body">
      <SidebarComponent class="main-layout__sidebar" />
      <main ref="mainScroll" class="main-layout__main">
        <div class="main-layout__content">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
  import { provide, ref } from 'vue';

  import HeaderComponent from '@/components/single-instance/headerComponent/headerComponent.vue';
  import SidebarComponent from '@/components/single-instance/sidebar-component.vue';

  const mainScroll = ref(null);
  provide('mainScroll', mainScroll);
</script>

<style lang="scss" scoped>
  .main-layout {
    width: 100%;
    @include flex($dir: column, $align: stretch);
    min-height: 100vh;
    height: 100%;
    overflow: hidden;

    &__body {
      @include flex($align: stretch);
      width: 100%;
      overflow: hidden;
    }

    &__sidebar {
      flex-shrink: 0;
    }

    &__main {
      overflow-y: auto;
      @include flex($dir: column, $align: stretch);
      flex-grow: 1;

      width: 100%;
      background-color: var(--palette-background);
      -webkit-overflow-scrolling: touch;
    }

    &__content {
      flex-grow: 1;
      width: 100%;
      padding: space(10);
    }
  }
</style>
