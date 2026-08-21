<template>
  <div class="category-attributes">
    <div class="header">
      <button @click="goBack" class="btn-back">
        <BaseIcon iconName="arrow-right" class="back-icon" />
        بازگشت
      </button>
      <h2 v-if="category">
        ویرایش ویژگی‌های دسته‌بندی «{{ category.titleFa }}»
      </h2>
    </div>

    <div v-if="loading" class="loading">در حال بارگذاری...</div>

    <div v-else-if="error" class="error">
      خطا در بارگذاری دسته‌بندی: {{ error.message }}
    </div>

    <template v-else-if="category">
      <div class="card">
        <div class="card-header">
          <h3>ویژگی‌ها</h3>
          <button v-if="!showNewRow" @click="openNewRow" class="btn-primary">
            <span class="icon">+</span>
            افزودن ویژگی
          </button>
        </div>

        <p class="hint">
          ویژگی‌ها در پنل فروشنده برای جمع‌آوری اطلاعات محصول استفاده می‌شوند.
        </p>

        <div v-if="!attributes.length && !showNewRow" class="empty">
          هیچ ویژگی‌ای تعریف نشده است. روی «افزودن ویژگی» بزنید تا یکی اضافه
          کنید.
        </div>

        <div v-else class="table">
          <div class="table-row table-head">
            <div class="col col-key">کلید (انگلیسی)</div>
            <div class="col col-label">عنوان (فارسی)</div>
            <div class="col col-placeholder">پلیس‌هولدر (فارسی)</div>
            <div class="col col-type">نوع</div>
            <div class="col col-required">وضعیت</div>
            <div class="col col-actions"></div>
          </div>

          <div
            v-for="(attr, index) in attributes"
            :key="attr.key"
            class="table-row"
          >
            <div class="col col-key" data-label="کلید">
              <span class="value-mono">{{ attr.key }}</span>
            </div>
            <div class="col col-label" data-label="برچسب">
              <span>{{ attr.label }}</span>
            </div>
            <div class="col col-placeholder" data-label="پلیس‌هولدر">
              <span>{{ attr.placeholder || '—' }}</span>
            </div>
            <div class="col col-type" data-label="نوع">
              <span class="badge">{{ typeLabel(attr.type) }}</span>
              <span
                v-if="attr.type === 'select' && attr.options?.length"
                class="options-count"
              >
                ({{ attr.options.length }} گزینه)
              </span>
            </div>
            <div class="col col-required" data-label="وضعیت">
              <span
                class="badge"
                :class="attr.required ? 'badge-required' : 'badge-optional'"
              >
                {{ attr.required ? 'الزامی' : 'اختیاری' }}
              </span>
            </div>
            <div class="col col-actions">
              <BaseTooltip class="action-btn" text="حذف ویژگی">
                <BaseIcon
                  iconName="trash-bin"
                  @click="removeAttribute(index)"
                  class="btn-icon delete"
                  :style="removing ? 'opacity: 0.5; pointer-events: none;' : ''"
                />
              </BaseTooltip>
            </div>

            <!-- Options of a select-type attribute, shown below the main row -->
            <div
              v-if="attr.type === 'select' && attr.options?.length"
              class="attribute-options"
            >
              <div class="attribute-options-title">گزینه‌ها:</div>
              <div class="attribute-options-list">
                <span
                  v-for="option in attr.options"
                  :key="option"
                  class="attribute-option-badge"
                >
                  {{ option }}
                </span>
              </div>
            </div>
          </div>

          <!-- Inline new attribute row -->
          <div v-if="showNewRow" class="table-row table-new">
            <div class="col col-key" data-label="کلید">
              <div class="field-cell autocomplete">
                <input
                  v-model="newKey"
                  type="text"
                  placeholder="کلید یکتای ذخیره سازی"
                  @input="normalizeKey"
                  @focus="openKeyDropdown"
                  @blur="closeKeyDropdown"
                  @keydown.escape="closeKeyDropdown"
                />
                <div v-if="showKeyDropdown" class="autocomplete-list">
                  <div v-if="attributesLoading" class="autocomplete-empty">
                    در حال بارگذاری ویژگی‌ها...
                  </div>
                  <div v-else-if="attributesError" class="autocomplete-empty">
                    خطا در بارگذاری ویژگی‌ها
                  </div>
                  <div
                    v-else-if="!keySuggestions.length"
                    class="autocomplete-empty"
                  >
                    ویژگی‌ای یافت نشد. کلید را دستی وارد کنید.
                  </div>
                  <div
                    v-for="attr in keySuggestions"
                    v-else
                    :key="attr.key"
                    class="autocomplete-option"
                    @mousedown.prevent="selectAttribute(attr)"
                  >
                    <span class="option-key">{{ attr.key }}</span>
                    <span class="option-label">{{ attr.label }}</span>
                  </div>
                </div>
                <span v-if="keyError" class="field-error">{{ keyError }}</span>
              </div>
            </div>
            <div class="col col-label" data-label="برچسب">
              <div class="field-cell">
                <input
                  v-model="newLabel"
                  type="text"
                  placeholder="عنوان نمایشی"
                />
                <span v-if="labelError" class="field-error">{{
                  labelError
                }}</span>
              </div>
            </div>
            <div class="col col-placeholder" data-label="پلیس‌هولدر">
              <div class="field-cell">
                <input
                  v-model="newPlaceholder"
                  type="text"
                  placeholder="مثال: مقدار را وارد کنید"
                />
                <span v-if="placeholderError" class="field-error">{{
                  placeholderError
                }}</span>
              </div>
            </div>
            <div class="col col-type" data-label="نوع">
              <select v-model="newType" class="type-select">
                <option value="text">متن</option>
                <option value="select">گزینش</option>
              </select>
              <span v-if="optionsError" class="field-error">{{
                optionsError
              }}</span>
            </div>
            <div class="col col-required" data-label="وضعیت">
              <label class="radio">
                <input v-model="newRequired" type="radio" :value="true" />
                الزامی
              </label>
              <label class="radio">
                <input v-model="newRequired" type="radio" :value="false" />
                اختیاری
              </label>
            </div>
            <div class="col col-actions">
              <button
                @click="addAttribute"
                :disabled="creating"
                class="btn-primary btn-sm"
              >
                {{ creating ? 'در حال افزودن...' : 'افزودن' }}
              </button>
              <button @click="cancelNewRow" class="btn-secondary btn-sm">
                انصراف
              </button>
            </div>

            <!-- Options editor for select-type attributes -->
            <div v-if="newType === 'select'" class="options-row">
              <div class="options-title">گزینه‌ها</div>
              <div class="options-list">
                <div
                  v-for="(option, index) in newOptions"
                  :key="index"
                  class="option-item"
                >
                  <div class="field-cell">
                    <input
                      v-model="newOptions[index]"
                      type="text"
                      placeholder="مقدار گزینه"
                      @blur="touchOption(index)"
                    />
                    <span
                      v-if="isOptionTouched(index) && !isOptionValid(index)"
                      class="field-error"
                    >
                      مقدار گزینه الزامی است.
                    </span>
                  </div>
                  <button
                    type="button"
                    class="btn-option-remove"
                    @click="removeOption(index)"
                  >
                    ×
                  </button>
                </div>
                <button
                  type="button"
                  class="btn-add-option"
                  :disabled="!canAddOption"
                  :title="
                    canAddOption
                      ? ''
                      : 'ابتدا مقدار گزینه‌های فعلی را وارد کنید.'
                  "
                  @click="addOption"
                >
                  + افزودن گزینه
                </button>
              </div>
            </div>
          </div>

          <div v-if="newRowError" class="row-error">{{ newRowError }}</div>
          <div v-if="createError" class="row-error">
            {{ errorMessage(createError) }}
          </div>
          <div v-if="removeError" class="row-error">
            {{ errorMessage(removeError) }}
          </div>
        </div>
      </div>

      <div class="footer">
        <div v-if="saveError" class="error">{{ errorMessage(saveError) }}</div>
        <button @click="save" :disabled="saving" class="btn-primary">
          {{ saving ? 'در حال ذخیره...' : 'ذخیره تغییرات' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
  import { ref, computed, watch, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useForm, useField } from 'vee-validate';
  import { toast } from 'vue3-toastify';
  import BaseIcon from '@/components/common/base/base-icon.vue';
  import BaseTooltip from '@/components/common/base/base-tooltip.vue';
  import { usePromise } from '@/composables';
  import { getCategory } from '@/services/category.service';
  import {
    getAttributes,
    createAttribute,
    attachCategoryAttributes,
    removeCategoryAttribute,
  } from '@/services/attribute.service';

  const route = useRoute();
  const router = useRouter();

  const {
    data: category,
    loading,
    error,
    execute: fetchCategory,
  } = usePromise(getCategory);

  // All available attributes (for the key autocomplete)
  const {
    data: allAttributes,
    loading: attributesLoading,
    error: attributesError,
    execute: fetchAttributes,
  } = usePromise(getAttributes);

  // Create attribute in the global catalog (POST /admin/attributes)
  const {
    loading: creating,
    error: createError,
    execute: createAttributePromise,
  } = usePromise(createAttribute);

  // Attach attributes to this category (POST /category/:categoryId)
  const {
    loading: saving,
    error: saveError,
    execute: saveAttributes,
  } = usePromise(attachCategoryAttributes);

  // Remove an attribute from this category (DELETE /category/:categoryId/:attributeId)
  const {
    loading: removing,
    error: removeError,
    execute: detachAttribute,
  } = usePromise(removeCategoryAttribute);

  const errorMessage = (err) =>
    err?.data?.message?.fa ||
    err?.response?.data?.message?.fa ||
    err?.message ||
    '';

  // Local working copy of attributes
  const attributes = ref([]);

  // New attribute inline form (validated with vee-validate)
  const showNewRow = ref(false);
  const newRowError = ref(null);
  const newRequired = ref(true);
  const newType = ref('text');
  const newOptions = ref([]);
  const optionsError = ref(null);
  const touchedOptions = ref(new Set());

  // Select-type attributes always start with one empty option row.
  watch(newType, (type) => {
    if (type === 'select' && !newOptions.value.length) {
      newOptions.value = [''];
    }
  });

  const isOptionValid = (index) =>
    !!(newOptions.value[index] || '').trim().length;

  // New option rows can only be added once every existing row has a value.
  const canAddOption = computed(() =>
    newOptions.value.every((_, index) => isOptionValid(index)),
  );

  const touchOption = (index) => {
    newOptions.value[index] = (newOptions.value[index] || '').trim();
    touchedOptions.value.add(index);
  };

  const isOptionTouched = (index) => touchedOptions.value.has(index);

  // Key autocomplete state
  const showKeyDropdown = ref(false);

  const { handleSubmit, resetForm } = useForm();
  const { value: newKey, errorMessage: keyError } = useField(
    'key',
    'required|attrKey',
    { label: 'کلید' },
  );
  const { value: newLabel, errorMessage: labelError } = useField(
    'label',
    'required|persianCharacter',
    { label: 'برچسب' },
  );
  const { value: newPlaceholder, errorMessage: placeholderError } = useField(
    'placeholder',
    'persianOrEnglish',
    { label: 'پلیس‌هولدر' },
  );

  const typeLabel = (type) => {
    switch (type) {
      case 'text':
        return 'متن';
      case 'select':
        return 'گزینش';
      default:
        return type;
    }
  };

  const normalizeKey = () => {
    newKey.value = newKey.value.trim().toLowerCase().replace(/\s+/g, '_');
  };

  // Suggestions for the key autocomplete, filtered by the current input
  // and excluding keys already added to this category.
  const keySuggestions = computed(() => {
    const list = allAttributes.value || [];
    const query = (newKey.value || '').trim().toLowerCase();
    const usedKeys = new Set(attributes.value.map((attr) => attr.key));

    const available = list.filter((attr) => !usedKeys.has(attr.key));

    if (!query) return available;

    return available.filter((attr) => {
      return (
        attr.key.toLowerCase().includes(query) ||
        (attr.label || '').toLowerCase().includes(query)
      );
    });
  });

  const openKeyDropdown = () => {
    // Load the attribute catalog lazily on first focus
    if (!allAttributes.value && !attributesLoading.value) {
      fetchAttributes();
    }
    showKeyDropdown.value = true;
  };

  const closeKeyDropdown = () => {
    showKeyDropdown.value = false;
  };

  const selectAttribute = (attr) => {
    // Commit immediately — selecting from the list counts as already added.
    if (!attributes.value.some((existing) => existing.key === attr.key)) {
      attributes.value.push({
        _id: attr._id,
        key: attr.key,
        label: attr.label,
        placeholder: attr.placeholder || '',
        type: attr.type || 'text',
        options: attr.options || [],
        required: !!attr.required,
      });
    }

    // Close the adding row — it only reopens fresh when the user clicks
    // «افزودن ویژگی» again.
    cancelNewRow();
  };

  const addOption = () => {
    if (!canAddOption.value) return;
    newOptions.value.push('');
  };

  const removeOption = (index) => {
    // Always keep at least one option row for select-type attributes.
    if (newOptions.value.length <= 1) {
      newOptions.value = [''];
      touchedOptions.value.delete(0);
      return;
    }
    newOptions.value.splice(index, 1);
    // Reindex remaining touched rows after the splice.
    touchedOptions.value = new Set(
      [...touchedOptions.value]
        .filter((i) => i !== index)
        .map((i) => (i > index ? i - 1 : i)),
    );
  };

  const resetNewRow = () => {
    resetForm({ values: { key: '', label: '', placeholder: '' } });
    newRequired.value = true;
    newType.value = 'text';
    newOptions.value = [];
    touchedOptions.value = new Set();
    optionsError.value = null;
    newRowError.value = null;
    showKeyDropdown.value = false;
  };

  const openNewRow = () => {
    resetNewRow();
    showNewRow.value = true;
  };

  const cancelNewRow = () => {
    showNewRow.value = false;
    resetNewRow();
  };

  const addAttribute = handleSubmit(async (values) => {
    const key = values.key.trim();

    if (attributes.value.some((attr) => attr.key === key)) {
      newRowError.value = 'این کلید قبلاً ثبت شده است؛ کلید تکراری مجاز نیست.';
      return;
    }

    // Select attributes need at least one non-empty option value.
    const options = newOptions.value
      .map((option) => option.trim())
      .filter(Boolean);

    if (newType.value === 'select' && !options.length) {
      // Surface the required error on every empty option row.
      newOptions.value.forEach((_, index) => touchedOptions.value.add(index));
      optionsError.value = 'برای نوع گزینش، حداقل یک گزینه با مقدار وارد کنید.';
      return;
    }
    optionsError.value = null;

    // Create the attribute in the global catalog right away and keep its id.
    const created = await createAttributePromise({
      key,
      label: values.label.trim(),
      placeholder: values.placeholder?.trim() || '',
      type: newType.value,
      options: newType.value === 'select' ? options : [],
      required: newRequired.value,
    });

    if (!created) return; // error handled by usePromise

    attributes.value.push({
      _id: created._id,
      key: created.key,
      label: created.label,
      placeholder: created.placeholder || '',
      type: created.type || 'text',
      options: created.options || [],
      required: !!created.required,
    });

    cancelNewRow();
  });

  const removeAttribute = async (index) => {
    const attr = attributes.value[index];
    if (!attr) return;

    // Attributes without an id only exist locally — just drop them.
    if (!attr._id) {
      attributes.value.splice(index, 1);
      return;
    }

    const removed = await detachAttribute(route.params.id, attr._id);
    if (!removed) return; // error handled by usePromise

    attributes.value.splice(index, 1);
  };

  const save = async () => {
    const attributeIds = attributes.value
      .map((attr) => attr._id)
      .filter(Boolean);

    const updated = await saveAttributes(route.params.id, attributeIds);
    if (!updated) return; // error handled by usePromise

    attributes.value = (updated?.attributes || []).map((attr) => ({
      _id: attr._id,
      key: attr.key,
      label: attr.label,
      placeholder: attr.placeholder || '',
      type: attr.type || 'text',
      options: attr.options || [],
      required: !!attr.required,
    }));
    toast.success('ویژگی‌های دسته‌بندی با موفقیت ذخیره شد.');
  };

  const goBack = () => {
    router.push({ name: 'categories' });
  };

  onMounted(() => {
    fetchAttributes();
    fetchCategory(route.params.id).then(() => {
      if (category.value) {
        attributes.value = (category.value.attributes || []).map((attr) => ({
          _id: attr._id,
          key: attr.key,
          label: attr.label,
          placeholder: attr.placeholder || '',
          type: attr.type || 'text',
          options: attr.options || [],
          required: !!attr.required,
        }));
      }
    });
  });
</script>

<style scoped>
  .category-attributes {
    padding: 24px;
    max-width: 1100px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
  }

  .header h2 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
  }

  .btn-back {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 14px;
    background: #e5e7eb;
    color: #374151;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  }

  .btn-back:hover {
    background: #d1d5db;
  }

  .back-icon {
    width: 18px;
    height: 18px;
  }

  .card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .card-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .hint {
    margin: 0 0 16px;
    font-size: 13px;
    color: #6b7280;
    line-height: 1.7;
  }

  .empty {
    padding: 28px 16px;
    text-align: center;
    color: #6b7280;
    background: #f9fafb;
    border: 1px dashed #d1d5db;
    border-radius: 8px;
  }

  .table {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .table-row {
    display: grid;
    grid-template-columns: 1.1fr 1.3fr 1.3fr 0.7fr 1.3fr auto;
    gap: 12px;
    align-items: center;
    padding: 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  .table-head {
    background: transparent;
    border: none;
    padding: 0 12px;
    font-size: 13px;
    font-weight: 600;
    color: #6b7280;
  }

  .table-new {
    background: #eff6ff;
    border-color: #bfdbfe;
  }

  .col {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .col-key,
  .col-label,
  .col-placeholder {
    flex-wrap: wrap;
  }

  .field-cell {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
  }

  .field-error {
    font-size: 11px;
    color: var(--palette-error);
    line-height: 1.4;
  }

  .autocomplete {
    position: relative;
  }

  .autocomplete-list {
    position: absolute;
    top: 100%;
    right: 0;
    left: auto;
    z-index: 30;
    margin-top: 4px;
    min-width: 100%;
    width: 520px;
    max-width: calc(100vw - 48px);
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    max-height: 260px;
    overflow-y: auto;
  }

  .autocomplete-empty {
    padding: 12px 14px;
    font-size: 12px;
    color: #6b7280;
  }

  .autocomplete-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.15s;
  }

  .autocomplete-option:hover {
    background: #f3f4f6;
  }

  .option-key {
    font-family: monospace;
    font-size: 13px;
    color: #374151;
  }

  .option-label {
    font-size: 12px;
    color: #6b7280;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .value-mono {
    font-family: monospace;
    font-size: 13px;
    color: #374151;
    background: #e5e7eb;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .badge {
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 999px;
    background: #e5e7eb;
    color: #374151;
    font-weight: 500;
  }

  .badge-required {
    background: #fee2e2;
    color: #991b1b;
  }

  .badge-optional {
    background: #dbeafe;
    color: #1e40af;
  }

  .col-actions {
    justify-content: flex-end;
    gap: 8px;
  }

  .btn-icon {
    cursor: pointer;
    width: 18px;
    height: 18px;
  }

  .btn-icon.delete {
    color: var(--palette-error);
  }

  .btn-primary {
    display: inline-flex;
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

  .btn-sm,
  .btn-primary.btn-sm,
  .btn-secondary.btn-sm {
    padding: 6px 12px;
    font-size: 13px;
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

  .radio {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #374151;
    cursor: pointer;
    margin-left: 12px;
  }

  .radio input[type='radio'] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .col input[type='text'] {
    width: 100%;
    padding: 7px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    transition: border-color 0.2s;
  }

  .col input[type='text']::placeholder {
    font-size: 11px;
    color: #9ca3af;
  }

  .col input[type='text']:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .row-error {
    color: #991b1b;
    font-size: 13px;
    padding: 0 12px;
  }

  .type-select {
    width: 100%;
    padding: 7px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
    background: white;
    cursor: pointer;
  }

  .type-select:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .options-count {
    font-size: 11px;
    color: #6b7280;
  }

  .attribute-options {
    grid-column: 1 / -1;
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 8px 10px;
    background: #f9fafb;
    border: 1px dashed #d1d5db;
    border-radius: 6px;
  }

  .attribute-options-title {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    white-space: nowrap;
  }

  .attribute-options-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .attribute-option-badge {
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 999px;
    background: #e5e7eb;
    color: #374151;
  }

  .options-row {
    grid-column: 1 / -1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: white;
    border: 1px solid #bfdbfe;
    border-radius: 8px;
  }

  .options-title {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
  }

  .options-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  .option-item {
    display: flex;
    align-items: flex-start;
    gap: 4px;
  }

  .option-item input {
    width: 180px;
    padding: 7px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 13px;
  }

  .option-item input:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .btn-option-remove {
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 6px;
    background: #fee2e2;
    color: #991b1b;
    font-size: 15px;
    line-height: 1;
    cursor: pointer;
  }

  .btn-option-remove:hover {
    background: #fecaca;
  }

  .btn-add-option {
    padding: 7px 12px;
    border: 1px dashed #93c5fd;
    border-radius: 6px;
    background: #eff6ff;
    color: #1e40af;
    font-size: 12px;
    cursor: pointer;
  }

  .btn-add-option:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-add-option:hover:not(:disabled) {
    background: #dbeafe;
  }

  .footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
  }

  .loading,
  .error {
    padding: 20px;
    text-align: center;
    border-radius: 8px;
  }

  .loading {
    background: #f3f4f6;
    color: #6b7280;
  }

  .error {
    background: #fee2e2;
    color: #991b1b;
  }

  /* Responsive */
  @media (max-width: 760px) {
    .table-head {
      display: none;
    }

    .table-row {
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .col-actions {
      grid-column: 1 / -1;
      justify-content: flex-end;
    }

    .col-required {
      flex-wrap: wrap;
    }

    .header {
      flex-wrap: wrap;
    }

    .footer {
      flex-direction: column-reverse;
      align-items: stretch;
    }

    .footer .btn-primary {
      justify-content: center;
    }
  }

  @media (max-width: 460px) {
    .category-attributes {
      padding: 16px;
    }

    .table-row {
      grid-template-columns: 1fr;
    }

    .col {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .col[data-label]::before {
      content: attr(data-label);
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
    }

    .col-actions {
      flex-wrap: wrap;
    }
  }
</style>
