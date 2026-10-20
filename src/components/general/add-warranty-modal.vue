<template>
  <DialogSheet
    v-model="isOpen"
    title="افزودن گارانتی جدید"
    width="600px"
    sheet-height="80vh"
  >
    <div class="add-warranty">
      <div class="add-warranty__field">
        <BaseLabel label="عنوان فارسی" required />
        <BaseTextInput
          name="newWarrantyName"
          variant="outlined"
          v-model="name"
          placeholder="مثال: گارانتی اصالت کالا"
          :isError="!!nameError"
          :hint="nameError"
        />
      </div>

      <div class="add-warranty__field">
        <BaseLabel label="عنوان انگلیسی" />
        <BaseTextInput
          dir="ltr"
          name="newWarrantyNameEn"
          variant="outlined"
          v-model="nameEn"
          placeholder="English title"
        />
      </div>

      <div class="add-warranty__field">
        <BaseLabel label="مدت اعتبار" required />
        <div class="add-warranty__duration">
          <BaseTextInput
            name="newWarrantyDuration"
            variant="outlined"
            isNumber
            supportsPersianDigits
            v-model="durationValue"
            placeholder="0"
            :isError="!!durationError"
            :hint="durationError"
          />
          <span class="add-warranty__duration-unit">ماه</span>
        </div>
      </div>

      <div class="add-warranty__images">
        <div
          v-for="side in imageSides"
          :key="side.key"
          class="add-warranty__field"
        >
          <BaseLabel :label="side.label" required />
          <div
            class="add-warranty__image-box"
            @click="inputRefs[side.key].click()"
          >
            <img
              v-if="previews[side.key]"
              :src="previews[side.key]"
              :alt="side.label"
              class="add-warranty__image-preview"
            />
            <template v-else>
              <span class="add-warranty__image-icon">+</span>
              <span class="add-warranty__image-label">افزودن تصویر</span>
            </template>
          </div>
          <input
            :ref="(el) => (inputRefs[side.key] = el)"
            type="file"
            accept="image/*"
            class="add-warranty__image-input"
            @change="(e) => onImageSelected(side.key, e)"
          />
          <span v-if="imageErrors[side.key]" class="add-warranty__error">
            {{ imageErrors[side.key] }}
          </span>
        </div>
      </div>

      <div class="add-warranty__field">
        <BaseLabel label="توضیحات" />
        <BaseTextArea
          name="newWarrantyDescription"
          label="توضیحات گارانتی..."
          v-model="description"
        />
      </div>
    </div>

    <template #footer>
      <div class="add-warranty__footer">
        <BaseButton variant="outlined" size="small" @click="close">
          انصراف
        </BaseButton>
        <BaseButton
          variant="filled"
          size="small"
          :isLoading="isSubmitting"
          :disabled="isUploading"
          @click="submit"
        >
          ثبت گارانتی
        </BaseButton>
      </div>
    </template>
  </DialogSheet>
</template>

<script setup>
  import { computed, reactive, ref, watch } from 'vue';
  import { useField } from 'vee-validate';
  import { toast } from 'vue3-toastify';

  import BaseButton from '@/components/common/base/base-button.vue';
  import BaseLabel from '@/components/common/base/base-label.vue';
  import BaseTextArea from '@/components/common/base/base-text-area.vue';
  import BaseTextInput from '@/components/common/base/base-text-input.vue';
  import DialogSheet from '@/components/general/dialog-sheet.vue';
  import { usePromise } from '@/composables';
  import { uploadFile } from '@/services/upload.service';
  import { addWarranty } from '@/services/warranty.service';

  const props = defineProps({
    modelValue: {
      type: Boolean,
      required: true,
    },
  });

  const emit = defineEmits(['update:modelValue', 'submit']);

  const isOpen = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const {
    value: name,
    errorMessage: nameError,
    resetField: resetName,
    validate: validateName,
  } = useField('newWarrantyName', 'required', {
    initialValue: '',
    label: 'عنوان فارسی',
  });

  const { value: nameEn, resetField: resetNameEn } = useField(
    'newWarrantyNameEn',
    undefined,
    { initialValue: '' },
  );

  const {
    value: durationValue,
    errorMessage: durationError,
    resetField: resetDuration,
    validate: validateDuration,
  } = useField('newWarrantyDuration', 'required', {
    initialValue: '',
    label: 'مدت اعتبار',
  });

  const { value: description, resetField: resetDescription } = useField(
    'newWarrantyDescription',
    undefined,
    { initialValue: '' },
  );

  // Submission is only allowed when every required field has a value
  const isValid = computed(
    () =>
      !!name.value && !!durationValue.value && !!images.front && !!images.back,
  );

  const { execute: executeAddWarranty, loading: isSubmitting } =
    usePromise(addWarranty);

  const { execute: executeUpload, loading: isUploading } = usePromise(
    uploadFile,
    {
      throwOnError: false,
      onError: async (err) => {
        console.error('Failed to upload warranty image:', err);
        toast.error('خطا در آپلود تصویر');
      },
    },
  );

  const imageSides = [
    { key: 'front', label: 'تصویر روی کارت' },
    { key: 'back', label: 'تصویر پشت کارت' },
  ];

  const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  // Uploaded image paths sent to the API
  const images = reactive({ front: '', back: '' });
  // Local preview URLs shown inside each image box
  const previews = reactive({ front: '', back: '' });
  const inputRefs = {};
  // Image errors are only shown after the first submit attempt
  const showImageErrors = ref(false);

  const imageErrors = computed(() => {
    if (!showImageErrors.value) return {};
    return {
      front: images.front ? '' : 'تصویر روی کارت الزامی است.',
      back: images.back ? '' : 'تصویر پشت کارت الزامی است.',
    };
  });

  function setPreview(side, url) {
    if (previews[side]?.startsWith('blob:')) {
      URL.revokeObjectURL(previews[side]);
    }
    previews[side] = url;
  }

  // Selecting a new image replaces the current one in the same box
  async function onImageSelected(side, e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error('فقط JPG, PNG, WebP مجاز است');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('حجم تصویر باید کمتر از 2 مگابایت باشد.');
      return;
    }

    const formData = new FormData();
    formData.append('images', file);
    formData.append('dir', 'warranty');

    const result = await executeUpload(formData);

    if (!result) return;
    images[side] = result.images[0];
    setPreview(side, URL.createObjectURL(file));
  }

  function resetForm() {
    resetName({ value: '' });
    resetNameEn({ value: '' });
    resetDuration({ value: '' });
    resetDescription({ value: '' });
    images.front = '';
    images.back = '';
    setPreview('front', '');
    setPreview('back', '');
    showImageErrors.value = false;
  }

  // Clear the form whenever the modal closes
  watch(isOpen, (open) => {
    if (!open) resetForm();
  });

  function close() {
    isOpen.value = false;
  }

  async function submit() {
    // Trigger validation so invalid fields display their errors on submit
    await Promise.all([validateName(), validateDuration()]);
    showImageErrors.value = true;

    if (!isValid.value) return;

    const formData = {
      name: name.value,
      nameEn: nameEn.value,
      duration: {
        value: Number(durationValue.value),
        unit: 'month',
      },
      images: {
        front: images.front,
        back: images.back,
      },
      description: description.value,
    };

    const createdWarranty = await executeAddWarranty(formData);

    if (!createdWarranty) return;

    toast.success('گارانتی با موفقیت ثبت شد.');
    emit('submit', createdWarranty);
    close();
  }
</script>

<style lang="scss" scoped>
  .add-warranty {
    @include flex(column);
    gap: space(5);
    padding: space(4);

    &__field {
      width: 100%;
      @include flex(column);
      gap: space(2);
    }

    &__duration {
      width: 100%;
      @include flex($align: stretch);
      gap: space(2);
    }

    &__duration-unit {
      min-width: 100px;
      border: 1px solid var(--palette-border-20);
      border-radius: space(2);
      @include flex($align: center, $justify: center);
      @include typography(body-medium);
      color: var(--palette-text-on-main-30);
      white-space: nowrap;
    }

    &__images {
      width: 100%;
      @include flex($align: flex-start);
      gap: space(4);
    }

    &__image-box {
      @include flex(column, $align: center, $justify: center);
      gap: space(2);
      width: 100%;
      height: 120px;
      border: 2px dashed var(--palette-border-20);
      border-radius: $radius-2x;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.15s;

      &:hover {
        border-color: var(--palette-primary);
        background: var(--palette-background);
      }
    }

    &__image-preview {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    &__image-icon {
      font-size: 28px;
      color: var(--palette-text-on-main-10);
      line-height: 1;
    }

    &__image-label {
      @include typography(body-medium);
      color: var(--palette-text-on-main-10);
    }

    &__image-input {
      display: none;
    }

    &__error {
      @include typography(body-small);
      color: var(--palette-error);
    }

    &__footer {
      width: 100%;
      @include flex($align: center, $justify: flex-end);
      gap: space(3);
      padding: space(3) space(4);
      border-top: 1px solid var(--palette-border-20);
    }
  }
</style>
