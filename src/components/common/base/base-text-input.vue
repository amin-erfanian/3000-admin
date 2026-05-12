<template>
  <div class="field-wrapper">
    <BaseLabel :label="label" :required="required" />
    <div class="field-wrapper__field field" :class="[fieldVariant, hasError]">
      <slot name="prepend">
        <base-icon
          v-if="prependIcon"
          :icon-name="prependIcon"
          class="field__icon"
        />
      </slot>
      <input
        class="field__input"
        :id="name"
        :dir="direction"
        :autocomplete="autocomplete"
        v-bind="$attrs"
        :value="props.modelValue"
        @input="handleInput"
      />
      <slot name="append">
        <base-icon
          v-if="appendIcon"
          :icon-name="appendIcon"
          class="field__icon"
        />
      </slot>

      <!-- <span v-if="hint" class="field__hint-bullet" /> -->
      <span
        v-if="hint"
        class="field__hint"
        :style="{ backgroundColor: `var(--palette-${props.hintBackground})` }"
      >
        {{ hint }}
      </span>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue';
  import BaseIcon from '@/components/common/base/base-icon.vue';
  import BaseLabel from '@/components/common/base/base-label.vue';

  const props = defineProps({
    direction: {
      type: String,
      default: 'rtl',
    },
    name: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    required: {
      type: Boolean,
      default: false,
    },
    autocomplete: {
      type: String,
      default: 'off',
    },
    prependIcon: {
      type: String,
      default: '',
    },
    appendIcon: {
      type: String,
      default: '',
    },
    variant: {
      type: String,
      default: 'text',
      validator: (value) => ['outlined', 'text'].includes(value),
    },
    modelValue: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
    hintBackground: {
      type: String,
      default: 'container-background',
    },
    isError: {
      type: Boolean,
      default: false,
    },
    supportsPersianDigits: {
      type: Boolean,
      default: false,
    },
    isNumber: {
      type: Boolean,
      default: false,
    },
  });

  const hasError = computed(() => ({
    'field--has-error': props.isError,
  }));

  const emit = defineEmits(['update:modelValue']);

  function handleInput(event) {
    let value = event.target.value;

    if (props.supportsPersianDigits) {
      value = convertPersianToEnglishDigits(value);
    }

    if (props.isNumber) {
      value = filterOnlyDigits(value);
    }

    event.target.value = value;

    emit('update:modelValue', value);
  }

  const fieldVariant = computed(() => `field--${props.variant}`);

  const convertPersianToEnglishDigits = (str) => {
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const englishDigits = '0123456789';

    return str.replace(
      /[۰-۹]/g,
      (d) => englishDigits[persianDigits.indexOf(d)],
    );
  };

  const filterOnlyDigits = (str) => {
    return str.replace(/[^0-9]/g, '');
  };
</script>

<style lang="scss" scoped>
  .field-wrapper {
    width: 100%;
    @include flex(column);
    gap: space();

    &__label {
      @include flex($align: center);
      gap: space(2);
    }

    &__label-text {
      @include typography(body-medium);
      color: var(--palette-text-on-main-10);
    }

    &__label-star {
      @include typography(body-medium);
      color: var(--palette-error);
    }

    &__field {
      width: 100%;
      position: relative;
    }

    .field {
      --border-color: var(--palette-border-20);
      padding: space(2) space(4);
      gap: space(2.5);
      transition: all 0.2s ease;
      border-radius: $radius-2x;

      background-color: transparent;
      @include flex(row, nowrap, center, center);

      &__hint {
        position: absolute;
        padding: 0 space(2);
        bottom: 0;
        transform: translateY(50%);
        right: 16px;
        color: var(--border-color);
        @include typography(body-small);
      }

      &--has-error {
        --border-color: var(--palette-error);
      }

      &--text {
        border: none;
      }

      &--outlined {
        border: 1px solid var(--border-color);
      }

      &__hint-bullet {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
        height: 10px;
        border-radius: $circle;
        background-color: var(--border-color);
      }

      &__icon {
        color: var(--palette-text-on-main-10);
      }

      &__input {
        border: none;
        outline: none;
        padding: 0;
        width: 100%;
        background-color: transparent;
        color: var(--palette-text-on-main-10);
        @include typography(body-medium);

        &--hidden {
          opacity: 0;
        }

        &:disabled {
          color: var(--palette-text-on-main-30);
        }

        &:-webkit-autofill {
          -webkit-background-clip: text;
          -webkit-text-fill-color: var(--palette-text-on-main-20);
        }
      }

      &:has(&__input:disabled) {
        opacity: 0.5;
        --border-color: var(--palette-text-on-main-30);
      }
    }
  }
</style>
