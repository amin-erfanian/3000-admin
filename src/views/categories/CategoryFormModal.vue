<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ modalTitle }}</h3>
        <button @click="$emit('close')" class="btn-close">&times;</button>
      </div>

      <div class="modal-body">
        <div class="form-grid">
          <BaseTextInput
            class="form-grid__field"
            name="titleFa"
            label="عنوان فارسی"
            :required="true"
            placeholder="عنوان فارسی"
            variant="outlined"
            v-model="titleFa"
            :hint="showErrors ? titleFaError : ''"
            :isError="showErrors && !!titleFaError"
          />

          <BaseTextInput
            class="form-grid__field"
            name="titleEn"
            label="عنوان انگلیسی"
            placeholder="English title"
            variant="outlined"
            direction="ltr"
            v-model="titleEn"
            :hint="showErrors ? titleEnError : ''"
            :isError="showErrors && !!titleEnError"
          />

          <BaseTextInput
            class="form-grid__field"
            name="slug"
            label="اسلاگ"
            :required="true"
            placeholder="slug-example"
            variant="outlined"
            direction="ltr"
            v-model="slug"
            :hint="showErrors ? slugError : ''"
            :isError="showErrors && !!slugError"
          />

          <BaseTextInput
            class="form-grid__field"
            name="commission"
            label="کمیسیون (%)"
            placeholder="0"
            variant="outlined"
            direction="ltr"
            isNumber
            v-model="commission"
            :hint="showErrors ? commissionError : ''"
            :isError="showErrors && !!commissionError"
          />

          <div class="form-grid__field form-grid__field--full public-ids">
            <BaseLabel label="شناسه‌های عمومی" />

            <div
              v-for="(id, index) in publicIds"
              :key="index"
              class="public-ids__row"
            >
              <BaseTextInput
                class="public-ids__input"
                :name="`publicId-${index}`"
                :placeholder="`شناسه عمومی ${index + 1}`"
                variant="outlined"
                direction="ltr"
                isNumber
                v-model="publicIds[index]"
              />

              <button
                v-if="publicIds.length > 1"
                type="button"
                class="btn-icon btn-icon--remove"
                title="حذف"
                @click="removePublicId(index)"
              >
                &times;
              </button>

              <button
                v-if="index === publicIds.length - 1"
                type="button"
                class="btn-icon btn-icon--add"
                :disabled="!allPublicIdsValid"
                :title="
                  allPublicIdsValid
                    ? 'افزودن شناسه جدید'
                    : 'ابتدا شناسه‌های فعلی را کامل کنید'
                "
                @click="addPublicId"
              >
                +
              </button>
            </div>
          </div>

          <div class="form-grid__field form-grid__field--full checkbox">
            <label>
              <input v-model="isActive" type="checkbox" />
              فعال
            </label>
          </div>
        </div>

        <div v-if="modalError" class="error">{{ modalError }}</div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-secondary">انصراف</button>
        <button
          @click="handleSubmit"
          :disabled="submitting"
          class="btn-primary"
        >
          {{ submitting ? 'در حال ذخیره...' : 'ذخیره' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { useForm, useField } from 'vee-validate';
  import BaseTextInput from '@/components/common/base/base-text-input.vue';
  import BaseLabel from '@/components/common/base/base-label.vue';
  import { createCategory, updateCategory } from '@/services/category.service';

  const props = defineProps({
    show: { type: Boolean, default: false },
    // The category being edited, or null when creating
    category: { type: Object, default: null },
    // Parent category id when adding a sub-category, otherwise null
    parentId: { type: String, default: null },
  });

  const emit = defineEmits(['close', 'saved']);

  const isEditMode = computed(() => !!props.category);
  const isAddingSubCategory = computed(
    () => !props.category && !!props.parentId,
  );

  const modalTitle = computed(() => {
    if (isEditMode.value) return 'ویرایش دسته‌بندی';
    if (isAddingSubCategory.value) return 'افزودن زیر دسته‌بندی';
    return 'افزودن دسته‌بندی جدید';
  });

  const { validate } = useForm();

  const { value: titleFa, errorMessage: titleFaError } = useField(
    'titleFa',
    'required|persianCharacter',
    { label: 'عنوان فارسی' },
  );

  const { value: titleEn, errorMessage: titleEnError } = useField(
    'titleEn',
    'passwordEnglish',
    { label: 'عنوان انگلیسی' },
  );

  const { value: slug, errorMessage: slugError } = useField(
    'slug',
    'required|slug',
    { label: 'اسلاگ' },
  );

  const { value: commission, errorMessage: commissionError } = useField(
    'commission',
    'between:0,100',
    { label: 'کمیسیون' },
  );

  const isActive = ref(true);
  const publicIds = ref(['']);
  const showErrors = ref(false);
  const submitting = ref(false);
  const modalError = ref(null);

  // A public id is valid when it is a non-empty string of digits.
  // `BaseTextInput` with `isNumber` already strips non-digits, so the
  // only invalid state here is an empty value.
  const isPublicIdValid = (value) => /^\d+$/.test(value);
  const allPublicIdsValid = computed(() =>
    publicIds.value.every(isPublicIdValid),
  );

  const addPublicId = () => {
    if (!allPublicIdsValid.value) return;
    publicIds.value.push('');
  };

  const removePublicId = (index) => {
    publicIds.value.splice(index, 1);
  };

  // Initialize the fields each time the modal is opened, so they reflect
  // the current category / parent context.
  watch(
    () => props.show,
    (visible) => {
      if (!visible) return;
      showErrors.value = false;
      modalError.value = null;

      if (props.category) {
        titleFa.value = props.category.titleFa ?? '';
        titleEn.value = props.category.titleEn ?? '';
        slug.value = props.category.slug ?? '';
        commission.value = props.category.commission ?? 0;
        isActive.value = props.category.isActive;
        publicIds.value =
          props.category.publicIds?.length > 0
            ? [...props.category.publicIds]
            : [''];
      } else {
        titleFa.value = '';
        titleEn.value = '';
        slug.value = '';
        commission.value = 0;
        isActive.value = true;
        publicIds.value = [''];
      }
    },
  );

  const buildCategoryPayload = () => ({
    titleFa: titleFa.value,
    titleEn: titleEn.value || '',
    slug: slug.value,
    parent: isEditMode.value
      ? props.category.parent || null
      : isAddingSubCategory.value
      ? props.parentId || null
      : null,
    // These are not editable in the form; preserve them on edit.
    image: isEditMode.value ? props.category.image || '' : '',
    returnReasonAlert: isEditMode.value
      ? props.category.returnReasonAlert || ''
      : '',
    commission: Number(commission.value) || 0,
    isActive: isActive.value,
    publicIds: publicIds.value.filter(isPublicIdValid),
  });

  const handleSubmit = async () => {
    showErrors.value = true;
    modalError.value = null;

    const { valid } = await validate();
    if (!valid) return;

    if (isAddingSubCategory.value && !props.parentId) {
      modalError.value = 'شناسه دسته‌بندی والد الزامی است.';
      return;
    }

    submitting.value = true;

    try {
      const payload = buildCategoryPayload();
      if (isEditMode.value) {
        await updateCategory(props.category._id, payload);
      } else {
        await createCategory(payload);
      }

      emit('saved');
    } catch (err) {
      modalError.value = err.response?.data?.message?.fa || err.message;
    } finally {
      submitting.value = false;
    }
  };
</script>

<style scoped lang="scss">
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal {
    background: white;
    border-radius: 12px;
    width: 90%;
    max-width: 720px;
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .modal-body {
    padding: 24px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px 20px;
  }

  .form-grid__field--full {
    grid-column: 1 / -1;
  }

  .checkbox {
    display: flex;
    align-items: center;
  }

  .checkbox label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
  }

  .checkbox input[type='checkbox'] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .btn-primary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .btn-primary:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .btn-secondary {
    padding: 10px 20px;
    background: #e5e7eb;
    color: #374151;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  }

  .btn-secondary:hover {
    background: #d1d5db;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-close:hover {
    color: #374151;
  }

  .public-ids {
    @include flex(column);
    gap: 12px;

    &__row {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    &__input {
      flex: 1;
      min-width: 0;
    }
  }

  .btn-icon {
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 22px;
    line-height: 1;
    transition: background 0.2s;
  }

  .btn-icon--add {
    background: #3b82f6;
    color: white;
  }

  .btn-icon--add:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-icon--add:disabled {
    background: #9ca3af;
    color: white;
    cursor: not-allowed;
  }

  .btn-icon--remove {
    background: #fee2e2;
    color: #991b1b;
  }

  .btn-icon--remove:hover {
    background: #fecaca;
  }

  .error {
    background: #fee2e2;
    color: #991b1b;
    margin-top: 16px;
    padding: 12px 16px;
    text-align: center;
    border-radius: 8px;
  }

  @media (max-width: 600px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
