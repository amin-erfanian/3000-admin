<template>
  <BaseModal v-model="showModal" title="رد کالا" width="760px">
    <div class="product-rejection-modal">
      <div class="product-rejection-modal__title"
        >ویژگی‌های دارای ایراد را انتخاب کنید</div
      >

      <div class="product-rejection-modal__selection">
        <BaseSelect
          v-model="selectedProperties"
          :options="productPropertyOptions"
          :multiple="true"
          option-label="name"
          option-value="value"
          label="ویژگی‌ها"
        />
      </div>
      <ProductRejectionChips
        :selected-items="selectedProperties"
        option-label="name"
        option-value="value"
        @remove="removeProperty"
      />

      <BaseTextArea
        v-model="hint"
        name="rejection-hint"
        label="توضیحات یا راهنمای رد کالا"
      />

      <div class="product-rejection-modal__actions">
        <BaseButton variant="outlined" @click="closeModal">انصراف</BaseButton>
        <BaseButton :disabled="isSubmitDisabled" @click="submitRejection">
          ثبت رد
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
  import { computed, ref, watch } from 'vue';
  import BaseModal from '@/components/common/base/base-modal.vue';
  import BaseSelect from '@/components/common/base/base-select.vue';
  import BaseTextArea from '@/components/common/base/base-text-area.vue';
  import BaseButton from '@/components/common/base/base-button.vue';
  import ProductRejectionChips from '@/components/general/product-rejection-chips.vue';

  const showModal = defineModel({ default: false });

  const props = defineProps({
    product: {
      type: Object,
      required: true,
    },
    propertyOptions: {
      type: Array,
      default: () => [],
    },
  });

  const emit = defineEmits(['submit']);

  const selectedProperties = ref([]);
  const hint = ref('');

  const productPropertyOptions = computed(() => {
    if (props.propertyOptions.length) return props.propertyOptions;

    if (!props.product || typeof props.product !== 'object') return [];

    return Object.keys(props.product).map((key) => ({
      name: key,
      value: key,
    }));
  });

  const isSubmitDisabled = computed(
    () => !hint.value.trim() || !selectedProperties.value.length,
  );

  const removeProperty = (property) => {
    selectedProperties.value = selectedProperties.value.filter(
      (item) => item.value !== property.value,
    );
  };

  const closeModal = () => {
    showModal.value = false;
  };

  const resetForm = () => {
    selectedProperties.value = [];
    hint.value = '';
  };

  watch(showModal, (isOpen) => {
    if (isOpen) return;
    resetForm();
  });

  const submitRejection = () => {
    if (isSubmitDisabled.value) return;

    emit('submit', {
      selectedProperties: selectedProperties.value,
      hint: hint.value,
    });
    closeModal();
  };
</script>

<style scoped lang="scss">
  .product-rejection-modal {
    @include flex(column);
    gap: space(4);
    width: 100%;

    &__title {
      @include typography(label-large);
      color: var(--palette-text-on-main-20);
    }

    &__selection {
      @include flex(column);
      gap: space(2);
    }

    &__actions {
      @include flex($justify: flex-end, $align: center);
      gap: space(2);
    }
  }
</style>
