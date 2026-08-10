<template>
  <div class="process-list">
    <div class="process-list__heading heading">
      <div class="heading__headline">هزینه پردازش</div>
      <div class="heading__border"></div>
      <div class="heading__text">
        در این بخش می‌توانید قوانین محاسبه هزینه پردازش بر اساس ابعاد محصول
        (عرض، طول و ارتفاع) را مدیریت کنید.
      </div>
    </div>

    <div class="process-list__toolbar">
      <BaseButton
        variant="filled"
        size="medium"
        prepend-icon="add"
        @click="openAddModal"
      >
        افزودن قانون جدید
      </BaseButton>
    </div>

    <div class="process-list__content">
      <div v-if="loading && !rules.length" class="process-list__empty">
        در حال بارگذاری...
      </div>
      <div v-else-if="!rules.length" class="process-list__empty">
        هیچ قانونی تعریف نشده است. برای شروع، روی «افزودن قانون جدید» بزنید.
      </div>

      <div v-else class="rules-cards">
        <div class="rules-cards__head">
          <div class="rules-cards__cell">عرض</div>
          <div class="rules-cards__cell">طول</div>
          <div class="rules-cards__cell">ارتفاع</div>
          <div class="rules-cards__cell">قیمت</div>
        </div>

        <div v-for="rule in rules" :key="rule._id" class="rules-cards__row">
          <div class="rules-cards__cell" data-label="عرض">
            <span class="dim">
              از {{ formatNumber(rule.widthFrom) }} تا
              {{ formatNumber(rule.widthTo) }} سانتی‌متر
            </span>
          </div>
          <div class="rules-cards__cell" data-label="طول">
            <span class="dim">
              از {{ formatNumber(rule.lengthFrom) }} تا
              {{ formatNumber(rule.lengthTo) }} سانتی‌متر
            </span>
          </div>
          <div class="rules-cards__cell" data-label="ارتفاع">
            <span class="dim">
              از {{ formatNumber(rule.heightFrom) }} تا
              {{ formatNumber(rule.heightTo) }} سانتی‌متر
            </span>
          </div>
          <div class="rules-cards__cell" data-label="قیمت">
            <span class="price">{{ formatPrice(rule.price) }} ریال</span>
          </div>
        </div>
      </div>
    </div>

    <BaseModal
      v-model="showAddModal"
      title="افزودن قانون هزینه پردازش"
      width="560px"
    >
      <div class="rule-form">
        <div
          v-for="dim in dimensionFields"
          :key="dim.key"
          class="rule-form__group"
        >
          <div class="rule-form__group-title">
            {{ dim.label }}
            <span class="rule-form__group-unit">(سانتی متر)</span>
          </div>
          <div class="rule-form__fields">
            <BaseTextInput
              placeholder="از"
              v-model="dim.from.value.value"
              :name="`${dim.key}-from`"
              :is-number="true"
              :supports-persian-digits="true"
              variant="outlined"
              :is-error="showErrors && !!dim.from.errorMessage.value"
              :hint="showErrors ? dim.from.errorMessage.value : ''"
            />
            <BaseTextInput
              placeholder="تا"
              v-model="dim.to.value.value"
              :name="`${dim.key}-to`"
              :is-number="true"
              :supports-persian-digits="true"
              variant="outlined"
              :is-error="showErrors && !!dim.to.errorMessage.value"
              :hint="showErrors ? dim.to.errorMessage.value : ''"
            />
          </div>
        </div>

        <div class="rule-form__group">
          <div class="rule-form__group-title">
            قیمت
            <span class="rule-form__group-unit">(ریال)</span>
          </div>
          <div class="rule-form__fields rule-form__fields--single">
            <BaseTextInput
              v-model="price.value.value"
              name="price"
              :is-number="true"
              :supports-persian-digits="true"
              variant="outlined"
              placeholder="قیمت را وارد کنید"
              :is-error="showErrors && !!price.errorMessage.value"
              :hint="showErrors ? price.errorMessage.value : ''"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <BaseButton variant="text" size="medium" @click="closeAddModal">
          انصراف
        </BaseButton>
        <BaseButton
          variant="filled"
          size="medium"
          :disabled="submitting"
          @click="submitRule"
        >
          {{ submitting ? 'در حال ثبت...' : 'ثبت قانون' }}
        </BaseButton>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useForm, useField } from 'vee-validate';
  import { toast } from 'vue3-toastify';

  import BaseButton from '@/components/common/base/base-button.vue';
  import BaseModal from '@/components/common/base/base-modal.vue';
  import BaseTextInput from '@/components/common/base/base-text-input.vue';
  import {
    getProcessRules,
    addProcessRule,
  } from '@/services/process-rule.service';

  const dimensions = [
    { key: 'width', label: 'عرض' },
    { key: 'length', label: 'طول' },
    { key: 'height', label: 'ارتفاع' },
  ];

  const rules = ref([]);
  const loading = ref(false);
  const showAddModal = ref(false);
  const showErrors = ref(false);
  const submitting = ref(false);

  const { validate, resetForm } = useForm();

  // Each range "to" value must be greater than or equal to its "from" value.
  // `minFieldValue:@<key>-from` resolves the referenced field's current value.
  const dimensionFields = dimensions.map((dim) => ({
    key: dim.key,
    label: dim.label,
    from: useField(`${dim.key}-from`, 'required', {
      label: `${dim.label} (از)`,
      initialValue: '',
    }),
    to: useField(`${dim.key}-to`, `required|minFieldValue:@${dim.key}-from`, {
      label: `${dim.label} (تا)`,
      initialValue: '',
    }),
  }));

  const price = useField('price', 'required', {
    label: 'قیمت',
    initialValue: '',
  });

  const fetchRules = async () => {
    loading.value = true;
    try {
      const data = await getProcessRules();
      rules.value = Array.isArray(data) ? data : [];
    } catch {
      // the http layer surfaces the error toast
    } finally {
      loading.value = false;
    }
  };

  onMounted(fetchRules);

  const resetFormFields = () => {
    showErrors.value = false;
    resetForm();
  };

  const openAddModal = () => {
    resetFormFields();
    showAddModal.value = true;
  };

  const closeAddModal = () => {
    showAddModal.value = false;
    resetFormFields();
  };

  const formatNumber = (value) => (Number(value) || 0).toLocaleString('fa-IR');

  const formatPrice = (value) => (Number(value) || 0).toLocaleString('fa-IR');

  // Build the payload in the server's flat shape:
  // { widthFrom, widthTo, lengthFrom, lengthTo, heightFrom, heightTo, price }
  // isActive defaults to true on the server, so it is not sent.
  const buildPayload = () => {
    const payload = { price: Number(price.value.value) };

    for (const dim of dimensionFields) {
      payload[`${dim.key}From`] = Number(dim.from.value.value);
      payload[`${dim.key}To`] = Number(dim.to.value.value);
    }

    return payload;
  };

  const submitRule = async () => {
    showErrors.value = true;

    // Submit is blocked until every field passes its rules.
    const { valid } = await validate();
    if (!valid) return;

    submitting.value = true;
    try {
      await addProcessRule(buildPayload());
      toast.success('قانون جدید با موفقیت ثبت شد.');
      closeAddModal();
      await fetchRules();
    } catch {
      // error toast handled by the http interceptor
    } finally {
      submitting.value = false;
    }
  };
</script>

<style lang="scss" scoped>
  .process-list {
    width: 100%;
    @include flex(column);
    gap: space(10);

    &__heading {
      width: 100%;
    }

    .heading {
      @include flex($align: center);
      gap: space(2);

      &__headline {
        @include typography(label-medium);
        font-weight: 900;
        color: var(--palette-text-on-main-10);
      }
      &__border {
        width: 2px;
        height: 20px;
        background-color: var(--palette-text-on-main-10);
        border-radius: 4px;
      }
      &__text {
        @include typography(body-small);
        color: var(--palette-text-on-main-30);
      }
    }

    &__toolbar {
      width: 100%;
      @include flex($align: center, $justify: flex-end);
    }
    &__content {
      width: 100%;
    }

    &__empty {
      border: 1px dashed var(--palette-border-10);
      border-radius: $radius-2x;
      padding: space(8);
      text-align: center;
      color: var(--palette-text-on-main-40);
      @include typography(body-medium);
    }
  }

  .rules-cards {
    width: 100%;
    @include flex(column, nowrap, stretch);
    gap: space(3);

    // The header card and every row card must share the exact same
    // column tracks so each header (عرض/طول/ارتفاع/قیمت) starts at the
    // same x-point as its values below. They therefore get an identical
    // box model: full width, same padding, same border, same grid.
    &__head,
    &__row {
      width: 100%;
      box-sizing: border-box;
      display: grid;
      grid-template-columns: 1.5fr 1.5fr 1.5fr 1.2fr;
      gap: space(3);
      align-items: center;
      padding: space(4) space(5);
      border-radius: $radius-3x;
    }

    &__head {
      background-color: var(--palette-surface-variant);
      border: 1px solid var(--palette-border-10);
      @include typography(body-small);
      font-weight: 700;
      color: var(--palette-text-on-main-20);
    }

    &__row {
      background-color: var(--palette-background);
      border: 1px solid var(--palette-border-10);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        border-color: var(--palette-border-20);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
      }
    }

    &__cell {
      @include flex($align: center);
      gap: space(2);
      @include typography(body-medium);
      color: var(--palette-text-on-main-10);
    }
  }

  .dim {
    font-variant-numeric: tabular-nums;
  }

  .price {
    font-weight: 700;
    color: var(--palette-primary);
    font-variant-numeric: tabular-nums;
  }

  .rule-form {
    width: 100%;
    @include flex(column);
    gap: space(5);

    &__hint {
      margin: 0;
      @include typography(body-small);
      color: var(--palette-text-on-main-30);
    }
    &__group {
      width: 100%;
      @include flex(column);
      gap: space(2);
    }
    &__group-title {
      @include typography(body-medium);
      font-weight: 700;
      color: var(--palette-text-on-main-10);
    }
    &__group-unit {
      @include typography(body-small);
      color: var(--palette-text-on-main-30);
    }
    &__fields {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: space(3);
      &--single {
        grid-template-columns: 1fr;
      }
    }
    &__error {
      @include typography(body-small);
      color: var(--palette-error);
      background-color: var(--palette-error-container, transparent);
      padding: space(2) space(3);
      border-radius: $radius-2x;
    }
  }

  @media (max-width: 640px) {
    .rules-cards__head {
      display: none;
    }
    .rules-cards__row {
      grid-template-columns: 1fr 1fr;
      gap: space(4) space(3);
    }
    .rules-cards__cell {
      justify-content: space-between;
      &[data-label]::before {
        content: attr(data-label);
        @include typography(body-small);
        font-weight: 700;
        color: var(--palette-text-on-main-30);
      }
    }
    .rule-form__fields {
      grid-template-columns: 1fr;
    }
  }
</style>
