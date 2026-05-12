<template>
  <div class="main-layout">
    <div class="main-layout__wrapper">
      <main class="main-layout__main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .main-layout {
    width: 100%;
    @include flex($dir: column, $align: center);
    max-height: 100dvh;
    min-height: 100dvh;

    &__wrapper {
      width: 100%;
      @include flex($dir: column, $align: center);
      max-height: 100dvh;
      min-height: 100dvh;
      overflow: hidden;
      margin: auto;
    }

    &__main {
      @include flex(column, nowrap, center, stretch);
      flex-grow: 1;
      width: 100%;
      -webkit-overflow-scrolling: touch;
      overflow-y: auto;
      overflow-x: hidden;
      -ms-overflow-style: none;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
</style>
