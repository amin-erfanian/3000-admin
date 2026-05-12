<template>
  <div class="dropdown">
    <div class="dropdown__label dropdown__label--open">
      <p>{{ label }}</p>
      <BaseIcon
        icon-name="arrow-right"
        class="dropdown__arrow-icon"
        :class="open ? 'dropdown__arrow-icon--open' : ''"
      />
    </div>
    <div class="dropdown__items">
      <div
        v-for="(item, index) of items"
        :key="index"
        class="dropdown__item"
        @click="selectOption(item)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue';
  import BaseIcon from '@/components/common/base/base-icon.vue';

  const emits = defineEmits(['click:item']);
  const props = defineProps({
    items: {
      type: Array,
      required: false,
    },
    label: {
      type: String,
      required: true,
    },
  });

  const open = ref(false);

  const selectOption = (item) => {
    emits('click:item', item);
  };
</script>

<style lang="scss" scoped>
  .dropdown {
    position: relative;
    width: 100%;
    height: fit-content;
    outline: none;

    &__label {
      @include flex($align: center, $justify: space-between);
      @include typography(body-medium);
      gap: space();
      background-color: transparent;
      color: var(--palette-text-on-main-10);
      padding: space() space(2);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
    }

    &__arrow-icon {
      transform: rotate(90deg);
      transition: transform 0.3s ease;
      color: var(--palette-text-on-main-10);
      width: 12px;
      height: 12px;
    }

    &:hover &__arrow-icon {
      transform: rotate(-90deg);
    }

    &__items {
      position: absolute;
      visibility: hidden;
      right: 0;
      z-index: 10;
      color: var(--palette-text-on-main-30);
      background-color: var(--palette-background);
      border-radius: 0px 0px $radius-2x $radius-2x;
      opacity: 0;
      transform: translateY(-10px);
      transition-property: visibility, transform, opacity;
      transition-duration: 0.3s;
      transition-timing-function: ease-out;
    }

    &:hover &__items {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    &__item {
      @include typography(body-small);
      background-color: transparent;
      padding: space(3) space(4);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      color: var(--palette-text-on-main-30);

      &:not(:last-child) {
        border-bottom: 1px solid var(--palette-border-10);
      }

      &:hover {
        color: var(--palette-text-on-main-10);
      }
    }
  }
</style>
