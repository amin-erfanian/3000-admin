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
  import TheFooter from '@/components/single-instance/the-footer.vue';

  const mainScroll = ref(null);
  provide('mainScroll', mainScroll);
</script>

<style lang="scss" scoped>
  .main-layout {
    width: 100%;
    @include flex($dir: column, $align: center);
    min-height: 100vh;

    &__body {
      @include flex($align: stretch);
      flex-grow: 1;
      width: 100%;
    }

    &__sidebar {
      flex-shrink: 0;
    }

    &__main {
      @include flex($dir: column, $align: center);
      flex-grow: 1;

      width: 100%;
      background-color: var(--palette-background);
      -webkit-overflow-scrolling: touch;
    }

    &__content {
      flex-grow: 1;
      width: 100%;
      height: 100%;
      padding: space(10);
    }
  }
</style>
