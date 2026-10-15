<template>
  <BaseModal v-model="showModal" title="ویرایش قیمت مرجع" width="480px">
    <div class="reference-price-modal">
      <div class="reference-price-modal__current">
        <span class="reference-price-modal__label">قیمت مرجع فعلی</span>
        <span class="reference-price-modal__value">
          {{ formatPrice(product.referencePrice) }} ریال
        </span>
      </div>

      <div class="reference-price-modal__field">
        <label
          class="reference-price-modal__label"
          :for="`reference-price-modal-${productId}`"
        >
          قیمت مرجع جدید (ریال)
        </label>
        <div class="reference-price-modal__input">
          <BaseNumberInput
            v-model="newPrice"
            :name="`reference-price-modal-${productId}`"
          />
        </div>
        <span v-if="newPrice" class="reference-price-modal__hint">
          {{ formatPrice(newPrice) }} ریال — با ثبت قیمت، همه درخواست‌های تغییر
          قیمت دیده‌شده می‌شوند.
        </span>
      </div>

      <div class="reference-price-modal__actions">
        <BaseButton variant="outlined" @click="closeModal">انصراف</BaseButton>
        <BaseButton
          :disabled="!newPrice"
          :is-loading="loading"
          @click="submitPrice"
        >
          ثبت قیمت مرجع
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import { toast } from 'vue3-toastify';
  import { usePromise } from '@/composables';
  import { updateReferencePrice } from '@/services/product.service';
  import BaseModal from '@/components/common/base/base-modal.vue';
  import BaseButton from '@/components/common/base/base-button.vue';
  import BaseNumberInput from '@/components/common/base/base-number-input.vue';

  const showModal = defineModel({ default: false });

  const props = defineProps({
    product: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['updated']);

  const newPrice = ref('');

  const { loading, isRejected, execute } = usePromise(updateReferencePrice);

  const productId = computed(() => props.product._id || props.product.id);

  const formatPrice = (value) => (Number(value) || 0).toLocaleString('fa-IR');

  const closeModal = () => {
    showModal.value = false;
  };

  watch(showModal, (isOpen) => {
    if (isOpen) return;
    newPrice.value = '';
  });

  const submitPrice = async () => {
    if (!newPrice.value) return;

    const referencePrice = Number(newPrice.value);
    await execute(productId.value, referencePrice);
    // error toast handled by the http interceptor
    if (isRejected.value) return;

    toast.success('قیمت مرجع با موفقیت به‌روزرسانی شد');
    emit('updated', { productId: productId.value, referencePrice });
    closeModal();
  };
</script>

<style scoped lang="scss">
  .reference-price-modal {
    @include flex(column);
    gap: space(4);
    width: 100%;

    &__current,
    &__field {
      @include flex(column);
      gap: space(1);
    }

    &__label {
      @include typography(label-small);
      color: var(--palette-text-on-main-40);
    }

    &__value {
      @include typography(body-large);
      font-weight: 700;
      color: var(--palette-text-on-main-10);
    }

    &__input {
      border: 1px solid var(--palette-border-20);
      border-radius: $radius-2x;
      padding: space(2) space(3);
    }

    &__hint {
      @include typography(body-small);
      color: var(--palette-text-on-main-30);
    }

    &__actions {
      @include flex($justify: flex-end, $align: center);
      gap: space(2);
    }
  }
</style>
