<template>
  <base-modal v-model="showModal" width="90%">
    <div class="confirmation-modal__content">
      <h4 class="confirmation-modal__title">{{ title }}</h4>
      <p v-if="hint" class="confirmation-modal__hint"> {{ hint }}</p>
    </div>
    <div v-if="hasActions" class="confirmation-modal__actions">
      <base-button
        is-block
        class="confirmation-modal__submit"
        :class="submitModifier"
        @click="confirm"
        :is-loading="submitLoading"
      >
        {{ confirmText }}
      </base-button>
      <base-button is-block class="confirmation-modal__cancel" @click="cancel">
        {{ cancelText }}
      </base-button>
    </div>
    <slot />
  </base-modal>
</template>

<script setup>
  import BaseModal from '@/components/common/base/base-modal.vue';
  import BaseButton from '@/components/common/base/base-button.vue';
  import { computed } from 'vue';

  const props = defineProps({
    title: {
      type: String,
      default: 'آیا نسبت به این عملیات مطمئن هستید؟',
    },
    hint: {
      type: String,
      default: '',
    },
    confirmText: {
      type: String,
      default: 'تایید',
    },
    variant: {
      type: String,
      default: 'normal',
      validator: (value) => ['normal', 'danger', 'warning'].includes(value),
    },
    cancelText: {
      type: String,
      default: 'لفو',
    },
    submitLoading: {
      type: Boolean,
      default: false,
    },
    hasActions: {
      type: Boolean,
      default: true,
    },
  });

  const submitModifier = computed(
    () => `confirmation-modal__submit--${props.variant}`,
  );

  const showModal = defineModel({ default: false });
  const emit = defineEmits(['confirm', 'cancel']);

  const confirm = () => emit('confirm');
  const cancel = () => emit('cancel');
</script>

<style lang="scss" scoped>
  .confirmation-modal {
    &__content {
      width: 100%;
      min-width: 17rem;
      margin-bottom: space(10);
      @include flex(column);
      gap: space(2);
    }

    &__hint {
      @include typography(body-small);
      color: var(--palette-text-on-main-30);
    }

    &__actions {
      @include flex($justify: space-between, $align: center);
      gap: space(2);
      color: var(--palette-text-on-minor-10);
    }

    &__cancel {
      background-color: var(--palette-disabled);
    }

    &__submit--normal {
      background-color: var(--palette-primary);
    }

    &__submit--danger {
      background-color: var(--palette-error);
    }

    &__submit--warning {
      background-color: var(--palette-warning);
    }
  }
</style>
