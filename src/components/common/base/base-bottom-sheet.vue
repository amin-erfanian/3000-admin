<template>
  <Teleport :to="teleportTo" :disabled="isTeleportDisabled">
    <Transition name="overlay">
      <div v-if="modelValue" class="overlay" @click.self="closeBottomSheet">
        <div
          class="bottom-sheet"
          :style="{
            height: height,
            borderRadius: !isRounded ? '0' : '',
          }"
        >
          <header v-if="$slots.header || title" class="bottom-sheet__header">
            <slot name="header">
              <span class="bottom-sheet__header-title">
                {{ title }}
              </span>
              <div @click="closeBottomSheet" class="bottom-sheet__icon-wrapper">
                <base-icon iconName="close-circle" class="bottom-sheet__icon" />
              </div>
            </slot>
          </header>

          <main
            class="bottom-sheet__content"
            :class="{ noscroll: noScrollBar }"
          >
            <slot />
          </main>

          <footer v-if="$slots.footer" class="bottom-sheet__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  import { ref } from 'vue';
  import BaseIcon from '@/components/common/base/base-icon.vue';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true,
    },
    title: {
      type: String,
    },
    isTeleportDisabled: {
      type: Boolean,
      default: false,
    },
    teleportTo: {
      type: String,
      default: '#app',
    },
    height: {
      type: String,
      default: 'auto',
    },
    noScrollBar: {
      type: Boolean,
      default: true,
    },
    barColor: {
      type: String,
      default: '',
    },
    hasHandle: {
      type: Boolean,
      default: true,
    },
    isRounded: {
      type: Boolean,
      default: true,
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const closeBottomSheet = () => {
    emit('update:modelValue', false);
  };
</script>

<style scoped lang="scss">
  .bottom-sheet {
    width: 100%;
    max-height: 100%;
    margin-top: auto;
    transition: all 0.3s ease-in-out;
    border-top-left-radius: $radius-4x;
    border-top-right-radius: $radius-4x;
    background-color: var(--palette-background);
    overflow: hidden;
    @include flex(column, nowrap, center);
    position: relative;

    &__header {
      width: 100%;
      min-height: 60px;
      @include flex($justify: space-between, $align: center);
      padding: space(4) space(8);
      border-bottom: 1px solid var(--palette-border-10);
      z-index: 10;
    }

    &__header-title {
      @include typography(title-small);
      color: var(--palette-text-on-main-10);
    }

    &__content {
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      padding: space(6) space(5);

      &.noscroll {
        @include hide-scrollbar();
      }
    }

    &__footer {
      width: 100%;
      gap: space(2);
      padding: space(4);
      @include flex(row, nowrap, center, center);
      border-top: 1px solid var(--palette-border-10);
    }

    &__icon-wrapper {
      @include flex($align: center, $justify: center);
      width: 32px;
      height: 32px;
    }

    &__icon {
      cursor: pointer;
      width: 24px;
      height: 24px;
      color: #fafafa;
    }
  }

  .overlay-leave-to,
  .overlay-enter-from {
    opacity: 0;
  }

  .overlay-enter-from .bottom-sheet,
  .overlay-leave-to .bottom-sheet {
    transform: translateY(100%);
  }
</style>
