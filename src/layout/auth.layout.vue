<template>
  <div class="auth-layout">
    <div class="auth-layout__container">
      <div class="auth-layout__header"> فروشگاه 3000 </div>
      <main class="auth-layout__main">
        <slot />
        <div class="auth-layout__options-wrapper">
          <div class="auth-layout__option-text">
            <span class="line-through"></span>
            <p> نیاز به راهنمایی دارید؟ </p>
          </div>
          <div class="auth-layout__options">
            <span>راهنمای ثبت نام</span>
            <span>تماس با پشتیبانی</span>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .auth-layout {
    width: 100%;
    @include flex($justify: center, $align: center);
    height: 100vh;

    &__container {
      @include flex($dir: column, $align: center);
      max-width: 500px;
      border: 1px solid var(--palette-border-10);
      background-color: var(--palette-container-background);
      padding: space(8);
      border-radius: space(6);
      overflow: hidden;
    }

    &__header {
      color: var(--palette-primary);
      @include typography(title-large);
      @include flex($justify: center, $align: center);
      flex-shrink: 0;
      width: 100%;
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

    &__options-wrapper {
      @include flex(column);
      width: 100%;
      gap: space(5);
    }

    &__signup-option {
      width: 100%;
      border-radius: space(2);
      cursor: pointer;
      background-color: var(--palette-secondary);
    }

    &__continue-option {
      width: 100%;
      border-radius: space(2);
      color: var(--palette-text-on-main-20);
      cursor: pointer;
    }

    &__option-text {
      @include flex($align: center, $justify: center);
      width: 100%;
      position: relative;

      p {
        padding: 0 space(2);
        position: relative;
        background-color: var(--palette-container-background);
        @include typography(body-small);
        color: var(--palette-text-on-main-30);
        z-index: 2;
        width: fit-content;
      }

      .line-through {
        z-index: 1;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        position: absolute;
        width: 100%;
        height: 1px;
        background-color: var(--palette-text-on-main-30);
      }
    }

    &__options {
      width: 100%;
      @include typography(body-small);
      @include flex($align: center, $justify: center);
      gap: space(6);

      span {
        cursor: pointer;
      }
    }
  }
</style>
