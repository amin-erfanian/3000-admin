<template>
  <div class="drop-content" v-click-outside="closeDropdown">
    <div class="drop-content__label" @click="open = !open">
      <p>{{ label }}</p>
      <BaseIcon
        icon-name="arrow-right"
        class="drop-content__arrow-icon"
        :class="open ? 'drop-content__arrow-icon--open' : ''"
      />
    </div>
    <div
      class="drop-content__content"
      :class="{ 'drop-content__content--open': open }"
    >
      <slot @close="closeDropdown"></slot>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import BaseIcon from '@/components/common/base/base-icon.vue';

  const props = defineProps({
    label: {
      type: String,
      default: 'انتخاب کنید',
    },
  });

  const open = ref(false);

  const closeDropdown = () => {
    open.value = false;
  };
</script>

<style lang="scss" scoped>
  .drop-content {
    position: relative;
    width: fit-content;

    &__label {
      @include flex($align: center, $justify: space-between);
      @include typography(body-small);
      gap: space();
      position: relative;
      background-color: transparent;
      border-radius: $radius-2x;
      border: 1px solid var(--palette-border-10);
      color: var(--palette-text-on-main-10);
      padding: space() space(2);
      cursor: pointer;
      user-select: none;
      flex-shrink: 0;
      white-space: nowrap;

      @include media-query(large) {
        @include typography(body-medium);
      }
    }

    &__arrow-icon {
      transform: rotate(90deg);
      transition: transform 0.3s ease;
      color: var(--palette-text-on-main-10);
      width: 16px;
      height: 16px;
    }

    &__arrow-icon--open {
      transform: rotate(-90deg);
    }

    &__content {
      border: 1px solid var(--palette-border-10);
      position: absolute;
      visibility: hidden;
      top: calc(100% + space(3));
      right: 0;
      width: fit-content;
      min-width: 300px;
      z-index: 10;
      color: var(--palette-text-on-main-30);
      background-color: var(--palette-background);
      border-radius: $radius-2x;
      opacity: 0;
      transform: translateY(-10px);
      transition-property: visibility, transform, opacity;
      transition-duration: 0.3s;
      transition-timing-function: ease-out;

      &--open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
        box-shadow: 0px 2px 4px var(--palette-background-shadow);
      }
    }
  }
</style>
