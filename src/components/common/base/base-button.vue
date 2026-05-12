<template>
  <button
    class="base-button"
    :type="buttonType"
    :disabled="disabledButton"
    :class="[buttonSize, buttonBlock, buttonVariant, buttonLoading]"
  >
    <template v-if="isLoading">
      <slot name="loading">
        <loading-spinner animation-duration="quarter" />
      </slot>
    </template>
    <div v-else class="base-button__content">
      <slot name="prepend">
        <base-icon v-if="prependIcon" :icon-name="prependIcon" />
      </slot>
      <slot />
      <slot name="append">
        <base-icon v-if="appendIcon" :icon-name="appendIcon" />
      </slot>
    </div>
  </button>
</template>

<script setup>
  import { computed } from 'vue';
  import BaseIcon from '@/components/common/base/base-icon.vue';
  import LoadingSpinner from '@/components/general/loading-spinner.vue';

  const props = defineProps({
    isLoading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    isBlock: {
      type: Boolean,
      default: false,
    },
    prependIcon: {
      type: String,
    },
    appendIcon: {
      type: String,
    },
    variant: {
      type: String,
      default: 'filled',
      validator: (value) => ['filled', 'outlined', 'text'].includes(value),
    },
    size: {
      type: String,
      default: 'large',
      validator: (value) =>
        ['x-small', 'small', 'medium', 'large'].includes(value),
    },
    buttonType: {
      type: String,
      default: 'button',
    },
  });

  const buttonSize = computed(() => `base-button--size-${props.size}`);
  const buttonBlock = computed(() => ({ 'base-button--block': props.isBlock }));
  const buttonVariant = computed(() => `base-button--variant-${props.variant}`);
  const buttonLoading = computed(() => ({
    'base-button--has-loading': props.isLoading,
  }));
  const disabledButton = computed(() => props.isLoading || props.disabled);
</script>

<style scoped lang="scss">
  .base-button {
    $opacity: 0.4;

    cursor: pointer;
    min-height: 3rem;
    transition: all 0.15s ease-in;
    border-radius: $radius-4x;
    @include typography(body-large);
    @include flex(row, nowrap, center, center);

    &--block {
      width: 100%;
    }

    &--size-x-small {
      min-height: 32px;
      padding: 0 space(4);
      border-radius: $radius-2x;
    }

    &--size-small {
      min-height: 40px;
      padding: 0 space(4);
    }

    &--size-medium {
      min-height: 48px;
      padding: 0 space(4);
    }

    &--size-large {
      min-height: 56px;
      padding: 0 space(4);
    }

    &--variant-text {
      border: none;
      color: var(--palette-primary);
      background-color: transparent;

      &:hover,
      &:focus {
        background-color: var(--palette-primary-shade);
      }

      &:disabled {
        opacity: $opacity;
        background-color: transparent;
        color: var(--palette-disabled);
      }
    }

    &--variant-filled {
      color: #fafafa;
      border: none;
      background-color: var(--palette-primary);

      &:disabled {
        box-shadow: none;
        color: var(--palette-text-on-minor-10);
        background-color: var(--palette-disabled);
      }
    }

    &--variant-outlined {
      color: var(--palette-primary);
      background-color: transparent;
      border: 1px solid var(--palette-primary);

      &:hover,
      &:focus {
        background-color: var(--palette-container-background);
      }

      &:disabled {
        opacity: $opacity;
        color: var(--palette-disabled);
        background-color: transparent;
        border-color: var(--palette-border-10);
      }
    }

    &--has-loading:disabled {
      --loading-color: var(--palette-container-background);
      --loading-size: 18px;
      border: 1px solid var(--palette-border-10);
      background-color: var(--palette-disabled);
    }

    &__content {
      gap: space(2);
      @include flex(row, nowrap, center, center);
    }
  }
</style>
