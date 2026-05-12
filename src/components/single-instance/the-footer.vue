<template>
  <footer class="footer">
    <!-- Row 1 -->
    <div class="footer__row footer__row--top">
      <div class="footer__logo">
        <!-- Replace with your logo -->
        <img src="@/assets/images/shop_outline.svg" alt="Logo" />
      </div>

      <BaseButton
        class="footer__back-to-top"
        @click="scrollToTop"
        variant="outlined"
        size="small"
      >
        بازگشت بالا
      </BaseButton>
    </div>

    <!-- Row 2 -->
    <div class="footer__row footer__row--contact">
      <p class="footer__contact-title">آدرس و شماره تماس</p>
      <p class="footer__contact-text">
        مشهد، بلوار امامیه، امامیه ۲، کامپیوتر ۳۰۰۰ (شماره تماس: 09201234567)
      </p>
    </div>

    <!-- Separator -->
    <div class="footer__separator"></div>

    <!-- Row 3 -->
    <div class="footer__row footer__row--bottom">
      <p class="footer__copy">© 2026 Your Company. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup>
  import { inject } from 'vue';
  import BaseButton from '../common/base/base-button.vue';

  const mainScroll = inject('mainScroll');

  const scrollToTop = () => {
    mainScroll?.value?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
</script>

<style lang="scss" scoped>
  .footer {
    width: 100%;
    padding: space(2) space(8);
    background: #dbdcdd;
    color: var(--palette-text-primary);
    @include flex($dir: column);
    gap: space(4);

    @include media-query(large) {
      padding: space(4) space(10);
    }

    &__row {
      width: 100%;
      @include flex($justify: space-between, $align: center);

      &--top {
        @include flex($justify: space-between, $align: center);
      }

      &--bottom {
        @include flex($justify: center);
        text-align: center;
      }
    }

    &__logo img {
      height: 36px;
      width: auto;

      @include media-query(large) {
        height: 44px;
      }
    }

    &__contact-title {
      font-size: 16px;
      font-weight: 700;
    }

    &__contact-text {
      font-size: 14px;
      color: var(--palette-text-secondary);
      line-height: 1.6;
    }

    &__separator {
      width: 100%;
      height: 1px;
      background: var(--palette-border-20);
    }

    &__copy {
      font-size: 13px;
      color: var(--palette-text-secondary);
    }
  }
</style>
