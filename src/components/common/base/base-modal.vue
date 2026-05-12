<template>
  <Teleport :to="teleportTo" :disabled="isTeleportDisabled">
    <Transition name="modal">
      <div v-if="modelValue" class="overlay" @click.self="closeModal">
        <dialog
          :open="modelValue"
          :style="{ width: width, height: height }"
          class="base-modal"
        >
          <header v-if="$slots.header || title" class="base-modal__header">
            <slot name="header">
              <span class="base-modal__header-title">{{ title }}</span>
            </slot>
            <!-- <base-svg-loader
              class="base-modal__header-close"
              name="close-sample"
              @click="closeModal"
            /> -->
          </header>
          <main class="base-modal__content">
            <slot />
          </main>
          <footer v-if="$slots.footer" class="base-modal__footer">
            <slot name="footer" />
          </footer>
        </dialog>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
  // import BaseSvgLoader from '@/components/common/base/base-svg-loader.vue';
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
    width: {
      type: String,
      default: '700px',
    },
    height: {
      type: String,
      default: 'auto',
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const closeModal = () => {
    emit('update:modelValue');
  };
</script>

<style lang="scss" scoped>
  .overlay {
    width: 100%;
    margin: 0 auto;
  }

  .base-modal {
    position: relative;
    border: 0;
    margin: auto;
    overflow-y: auto;
    max-height: 100vh;
    max-height: 80%;
    @include flex(column);
    transition: all 0.3s ease-in-out;
    border-radius: $radius-5x;
    color: var(--palette-text-on-main-20);
    background-color: var(--palette-background);
    width: 100%;

    &__header {
      width: 100%;
      min-height: 60px;
      padding: space(4) space(8);
      border-bottom: 1px solid var(--palette-border-10);
      @include flex($justify: space-between, $align: center);
    }

    &__header-title {
      @include typography(title-small);
      color: var(--palette-text-on-main-20);
    }

    &__header-close {
      cursor: pointer;
      fill: var(--palette-text-on-main-20);
    }

    &__content {
      width: 100%;
      padding: space(6) space(5);
      @include typography(body-large);
      overflow: auto;
    }

    &__footer {
      width: 100%;
      gap: space(2);
      padding: space(3);
      @include flex(row, nowrap, center, center);
      border-top: 1px solid var(--palette-container-background);
      margin-top: auto;
    }
  }

  .modal-enter-from {
    opacity: 0;
  }

  .modal-leave-to {
    opacity: 0;
  }

  .modal-enter-from .base-modal,
  .modal-leave-to .base-modal {
    transform: scale(1.1);
  }
</style>
