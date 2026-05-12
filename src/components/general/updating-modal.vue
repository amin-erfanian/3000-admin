<template>
  <base-modal v-model="showModal" width="90%">
    <template v-if="!isUpdating">
      <div class="confirmation-modal__content">
        <h4 class="confirmation-modal__title">
          نسخه جدیدی برای پولاتو وجود داره! میخوای بروزرسانی رو انجام بدی؟
        </h4>
        <p class="confirmation-modal__hint">
          بروزرسانی کمتر از چند دقیقه زمان میبره ولی تجربه کاربری بهتری رو در
          اختیارت قرار میده.
        </p>
      </div>
      <div class="confirmation-modal__actions">
        <base-button
          is-block
          class="confirmation-modal__submit"
          :class="submitModifier"
          @click="confirm"
          :is-loading="submitLoading"
        >
          بروزرسانی کن
        </base-button>
        <base-button
          is-block
          class="confirmation-modal__cancel"
          @click="cancel"
        >
          بیخیال
        </base-button>
      </div>
    </template>
    <template v-else>
      <div class="confirmation-modal__content">
        <h4 class="confirmation-modal__updating"> در حال بروزرسانی... </h4>
      </div>
      <div class="confirmation-modal__actions">
        <base-button
          is-block
          class="confirmation-modal__cancel"
          @click="cancel"
        >
          بیخیال!
        </base-button>
      </div>
    </template>
  </base-modal>
</template>

<script setup>
  import BaseModal from '@/components/common/base/base-modal.vue';
  import BaseButton from '@/components/common/base/base-button.vue';
  import { onUnmounted, ref } from 'vue';

  const props = defineProps({
    isUpdateCritical: {
      type: Boolean,
      default: false,
    },
  });
  const emit = defineEmits(['cancel', 'confirm']);

  const isUpdating = ref(false);
  const showModal = defineModel({ default: false });

  const confirm = async () => {
    isUpdating.value = true;
    updateApp();
  };

  const cancel = () => emit('cancel');

  const updateApp = async () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.getRegistration();
      registration.waiting.postMessage({
        type: 'SKIP_WAITING',
      });
      isUpdating.value = true;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log(
          'A new service worker has taken control. Reloading the page...',
        );
        window.location.reload();
      });
    }
  };
</script>

<style lang="scss" scoped>
  .confirmation-modal {
    &__content {
      width: 100%;
      min-width: 17rem;
      margin-bottom: space(10);
      @include flex(column);
      gap: space(3);
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
      border: var(--palette-disabled);
    }

    &__submit--normal {
      background-color: var(--palette-primary);
      border: var(--palette-primary);
    }

    &__submit--danger {
      background-color: var(--palette-error);
      border: var(--palette-error);
    }

    &__submit--warning {
      background-color: var(--palette-warning);
      border: var(--palette-warning);
    }

    &__updating {
      width: 100%;
      text-align: center;
    }
  }
</style>
