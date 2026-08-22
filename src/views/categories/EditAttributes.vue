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

        <div v-else class="attributes-list">
          <div
            v-for="(attr, index) in attributes"
            :key="attr.key"
            class="attribute-row"
            :class="{ 'table-new': isEditing(attr) }"
          >
            <!-- Inline edit row (replaces the display row) -->
            <template v-if="isEditing(attr)">
              <div class="form-row form-row-main">
                <div class="col col-key" data-label="کلید">
                  <div class="field-cell">
                    <label class="field-label">کلید</label>
                    <span class="value-mono">{{ editKey }}</span>
                  </div>
                </div>
                <div class="col col-label" data-label="عنوان">
                  <div class="field-cell">
                    <label class="field-label">عنوان</label>
                    <input
                      v-model="editLabel"
                      type="text"
                      placeholder="عنوان نمایشی"
                    />
                    <span v-if="editLabelError" class="field-error">{{
                      editLabelError
                    }}</span>
                  </div>
                </div>
                <div class="col col-header" data-label="دسته">
                  <div class="field-cell autocomplete">
                    <label class="field-label">دسته</label>
                    <input
                      v-model="editHeader"
                      type="text"
                      placeholder="مثال: مشخصات فنی"
                      @focus="openEditHeaderDropdown"
                      @blur="showEditHeaderDropdown = false"
                      @keydown.escape="showEditHeaderDropdown = false"
                    />
                    <div
                      v-if="showEditHeaderDropdown"
                      class="autocomplete-list autocomplete-list-sm"
                    >
                      <div v-if="headersLoading" class="autocomplete-empty">
                        در حال بارگذاری دسته‌ها...
                      </div>
                      <div v-else-if="headersError" class="autocomplete-empty">
                        خطا در بارگذاری دسته‌ها
                      </div>
                      <div
                        v-else-if="!editHeaderSuggestions.length"
                        class="autocomplete-empty"
                      >
                        دسته‌ای یافت نشد. مقدار را دستی وارد کنید.
                      </div>
                      <div
                        v-for="header in editHeaderSuggestions"
                        v-else
                        :key="header"
                        class="autocomplete-option"
                        @mousedown.prevent="selectEditHeader(header)"
                      >
                        <span class="option-key">{{ header }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="form-row form-row-secondary">
                <div class="col col-placeholder" data-label="پلیس‌هولدر">
                  <div class="field-cell">
                    <label class="field-label">پلیس‌هولدر</label>
                    <input
                      v-model="editPlaceholder"
                      type="text"
                      placeholder="مثال: مقدار را وارد کنید"
                    />
                  </div>
                </div>
                <div class="col col-type" data-label="نوع">
                  <div class="field-cell">
                    <label class="field-label">نوع</label>
                    <select v-model="editType" class="type-select">
                      <option value="text">متن</option>
                      <option value="select">گزینش</option>
                    </select>
                    <span v-if="editOptionsError" class="field-error">{{
                      editOptionsError
                    }}</span>
                  </div>
                </div>
                <div class="col col-required" data-label="وضعیت">
                  <div class="field-cell">
                    <label class="field-label">وضعیت</label>
                    <select v-model="editRequired" class="type-select">
                      <option :value="true">الزامی</option>
                      <option :value="false">اختیاری</option>
                    </select>
                  </div>
                </div>
                <div class="col col-actions">
                  <button
                    @click="saveEdit(attr, index)"
                    :disabled="updating"
                    class="btn-primary btn-sm"
                  >
                    {{ updating ? 'در حال ویرایش...' : 'ویرایش' }}
                  </button>
                  <button @click="cancelEdit" class="btn-secondary btn-sm">
                    انصراف
                  </button>
                </div>
              </div>

              <!-- Options editor for select-type attributes -->
              <div v-if="editType === 'select'" class="options-row">
                <div class="options-title">گزینه‌ها</div>
                <div class="options-list">
                  <div
                    v-for="(option, optionIndex) in editOptions"
                    :key="optionIndex"
                    class="option-item"
                  >
                    <div class="field-cell">
                      <input
                        v-model="editOptions[optionIndex]"
                        type="text"
                        placeholder="مقدار گزینه"
                        @blur="
                          editOptions[optionIndex] =
                            editOptions[optionIndex].trim()
                        "
                      />
                      <span
                        v-if="!editOptions[optionIndex].trim()"
                        class="field-error"
                      >
                        مقدار گزینه الزامی است.
                      </span>
                    </div>
                    <button
                      type="button"
                      class="btn-option-remove"
                      @click="removeEditOption(optionIndex)"
                    >
                      ×
                    </button>
                  </div>
                  <button
                    type="button"
                    class="btn-add-option"
                    :disabled="!canAddEditOption"
                    :title="
                      canAddEditOption
                        ? ''
                        : 'ابتدا مقدار گزینه‌های فعلی را وارد کنید.'
                    "
                    @click="addEditOption"
                  >
                    + افزودن گزینه
                  </button>
                </div>
              </div>
            </template>

            <!-- Display row: same form layout, read-only, with edit/delete actions -->
            <template v-else>
              <div class="form-row form-row-main">
                <div class="col col-key" data-label="کلید">
                  <div class="field-cell">
                    <label class="field-label">کلید</label>
                    <span class="value-mono">{{ attr.key }}</span>
                  </div>
                </div>
                <div class="col col-label" data-label="عنوان">
                  <div class="field-cell">
                    <label class="field-label">عنوان</label>
                    <span class="field-value">{{ attr.label }}</span>
                  </div>
                </div>
                <div class="col col-header" data-label="دسته">
                  <div class="field-cell">
                    <label class="field-label">دسته</label>
                    <span class="field-value">{{ attr.header || '—' }}</span>
                  </div>
                </div>
              </div>
              <div class="form-row form-row-secondary">
                <div class="col col-placeholder" data-label="پلیس‌هولدر">
                  <div class="field-cell">
                    <label class="field-label">پلیس‌هولدر</label>
                    <span class="field-value">{{
                      attr.placeholder || '—'
                    }}</span>
                  </div>
                </div>
                <div class="col col-type" data-label="نوع">
                  <div class="field-cell">
                    <label class="field-label">نوع</label>
                    <span class="field-value">{{ typeLabel(attr.type) }}</span>
                  </div>
                </div>
                <div class="col col-required" data-label="وضعیت">
                  <div class="field-cell">
                    <label class="field-label">وضعیت</label>
                    <span class="field-value">{{
                      attr.required ? 'الزامی' : 'اختیاری'
                    }}</span>
                  </div>
                </div>
                <div class="col col-actions">
                  <button
                    class="btn-primary btn-sm"
                    :disabled="removing"
                    @click="startEdit(attr)"
                  >
                    ویرایش
                  </button>
                  <button
                    class="btn-secondary btn-sm btn-delete"
                    :style="
                      removing ? 'opacity: 0.5; pointer-events: none;' : ''
                    "
                    @click="removeAttribute(index)"
                  >
                    حذف
                  </button>
                </div>
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
            </template>
          </div>

          <!-- Inline new attribute row -->
          <div v-if="showNewRow" class="attribute-row table-new">
            <div class="form-row form-row-main">
              <div class="col col-key" data-label="کلید">
                <div class="field-cell autocomplete">
                  <label class="field-label">کلید</label>
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
                  <span v-if="keyError" class="field-error">{{
                    keyError
                  }}</span>
                </div>
              </div>
              <div class="col col-label" data-label="عنوان">
                <div class="field-cell">
                  <label class="field-label">عنوان</label>
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
              <div class="col col-header" data-label="دسته">
                <div class="field-cell autocomplete">
                  <label class="field-label">دسته</label>
                  <input
                    v-model="newHeader"
                    type="text"
                    placeholder="مثال: مشخصات فنی"
                    @focus="openNewHeaderDropdown"
                    @blur="showNewHeaderDropdown = false"
                    @keydown.escape="showNewHeaderDropdown = false"
                  />
                  <div
                    v-if="showNewHeaderDropdown"
                    class="autocomplete-list autocomplete-list-sm"
                  >
                    <div v-if="headersLoading" class="autocomplete-empty">
                      در حال بارگذاری دسته‌ها...
                    </div>
                    <div v-else-if="headersError" class="autocomplete-empty">
                      خطا در بارگذاری دسته‌ها
                    </div>
                    <div
                      v-else-if="!newHeaderSuggestions.length"
                      class="autocomplete-empty"
                    >
                      دسته‌ای یافت نشد. مقدار را دستی وارد کنید.
                    </div>
                    <div
                      v-for="header in newHeaderSuggestions"
                      v-else
                      :key="header"
                      class="autocomplete-option"
                      @mousedown.prevent="selectNewHeader(header)"
                    >
                      <span class="option-key">{{ header }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="form-row form-row-secondary">
              <div class="col col-placeholder" data-label="پلیس‌هولدر">
                <div class="field-cell">
                  <label class="field-label">پلیس‌هولدر</label>
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
                <div class="field-cell">
                  <label class="field-label">نوع</label>
                  <select v-model="newType" class="type-select">
                    <option value="text">متن</option>
                    <option value="select">گزینش</option>
                  </select>
                  <span v-if="optionsError" class="field-error">{{
                    optionsError
                  }}</span>
                </div>
              </div>
              <div class="col col-required" data-label="وضعیت">
                <div class="field-cell">
                  <label class="field-label">وضعیت</label>
                  <select v-model="newRequired" class="type-select">
                    <option :value="true">الزامی</option>
                    <option :value="false">اختیاری</option>
                  </select>
                </div>
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
          <div v-if="updateError" class="row-error">
            {{ errorMessage(updateError) }}
          </div>
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
  import { usePromise } from '@/composables';
  import { getCategory } from '@/services/category.service';

  import {
    getAttributes,
    getHeaders,
    createAttribute,
    updateAttribute,
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

  // All available headers (for the header autocomplete)
  const {
    data: allHeaders,
    loading: headersLoading,
    error: headersError,
    execute: fetchHeaders,
  } = usePromise(getHeaders);

  // Create attribute in the global catalog (POST /admin/attributes)
  const {
    loading: creating,
    error: createError,
    execute: createAttributePromise,
  } = usePromise(createAttribute);

  // Update an attribute in the global catalog (PUT /admin/attributes/:id)
  const {
    loading: updating,
    error: updateError,
    execute: updateAttributePromise,
  } = usePromise(updateAttribute);

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
  const newHeader = ref('');
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

  // Header autocomplete state (a separate dropdown per form)
  const showNewHeaderDropdown = ref(false);
  const showEditHeaderDropdown = ref(false);

  // Suggestions for the header autocompletes, filtered by the current input
  const headerSuggestions = (query) => {
    const list = allHeaders.value || [];
    const q = (query || '').trim().toLowerCase();
    if (!q) return list;
    return list.filter((header) => header.toLowerCase().includes(q));
  };

  const newHeaderSuggestions = computed(() =>
    headerSuggestions(newHeader.value),
  );
  const editHeaderSuggestions = computed(() =>
    headerSuggestions(editHeader.value),
  );

  const openNewHeaderDropdown = () => {
    if (!allHeaders.value && !headersLoading.value) {
      fetchHeaders();
    }
    showNewHeaderDropdown.value = true;
  };

  const openEditHeaderDropdown = () => {
    if (!allHeaders.value && !headersLoading.value) {
      fetchHeaders();
    }
    showEditHeaderDropdown.value = true;
  };

  const selectNewHeader = (header) => {
    newHeader.value = header;
    showNewHeaderDropdown.value = false;
  };

  const selectEditHeader = (header) => {
    editHeader.value = header;
    showEditHeaderDropdown.value = false;
  };

  // Inline edit state for an existing attribute
  const editingId = ref(null);
  const editKey = ref('');
  const editLabel = ref('');
  const editHeader = ref('');
  const editPlaceholder = ref('');
  const editType = ref('text');
  const editRequired = ref(true);
  const editOptions = ref([]);
  const editLabelError = ref(null);
  const editOptionsError = ref(null);

  const isEditing = (attr) => attr._id && attr._id === editingId.value;

  const canAddEditOption = computed(() =>
    editOptions.value.every((option) => !!option.trim()),
  );

  const startEdit = (attr) => {
    cancelNewRow();
    editingId.value = attr._id;
    editKey.value = attr.key;
    editLabel.value = attr.label;
    editHeader.value = attr.header || '';
    editPlaceholder.value = attr.placeholder || '';
    editType.value = attr.type || 'text';
    editRequired.value = !!attr.required;
    editOptions.value = [...(attr.options || [])];
    editLabelError.value = null;
    editOptionsError.value = null;
  };

  const cancelEdit = () => {
    editingId.value = null;
    editLabelError.value = null;
    editOptionsError.value = null;
    showEditHeaderDropdown.value = false;
  };

  const addEditOption = () => {
    if (!canAddEditOption.value) return;
    editOptions.value.push('');
  };

  const removeEditOption = (index) => {
    // Always keep at least one option row for select-type attributes.
    if (editOptions.value.length <= 1) {
      editOptions.value = [''];
      return;
    }
    editOptions.value.splice(index, 1);
  };

  const saveEdit = async (attr, index) => {
    editLabelError.value = null;
    editOptionsError.value = null;

    const label = editLabel.value.trim();
    if (!label) {
      editLabelError.value = 'برچسب الزامی است.';
      return;
    }

    const options = editOptions.value
      .map((option) => option.trim())
      .filter(Boolean);
    if (editType.value === 'select' && !options.length) {
      editOptionsError.value =
        'برای نوع گزینش، حداقل یک گزینه با مقدار وارد کنید.';
      return;
    }

    const updated = await updateAttributePromise(attr._id, {
      key: attr.key,
      label,
      header: editHeader.value.trim(),
      placeholder: editPlaceholder.value.trim(),
      type: editType.value,
      options: editType.value === 'select' ? options : [],
      required: editRequired.value,
    });

    if (!updated) return; // error handled by usePromise

    // Fall back to the local payload when the API returns no body.
    attributes.value.splice(index, 1, {
      _id: updated._id || attr._id,
      key: updated.key || attr.key,
      label: updated.label || label,
      header: updated.header ?? editHeader.value.trim(),
      placeholder: updated.placeholder ?? editPlaceholder.value.trim(),
      type: updated.type || editType.value,
      options: updated.options || options,
      required: updated.required ?? editRequired.value,
    });

    cancelEdit();
  };

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
        header: attr.header || '',
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
    newHeader.value = '';
    newRequired.value = true;
    newType.value = 'text';
    newOptions.value = [];
    touchedOptions.value = new Set();
    optionsError.value = null;
    newRowError.value = null;
    showKeyDropdown.value = false;
    showNewHeaderDropdown.value = false;
  };

  const openNewRow = () => {
    cancelEdit();
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
      header: newHeader.value.trim(),
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
      header: created.header ?? newHeader.value.trim(),
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
      header: attr.header || '',
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
          header: attr.header || '',
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

  .attributes-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .attribute-row {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  /* Sub-rows used by the display/add/edit forms to spread fields over two lines */
  .form-row {
    display: grid;
    gap: 12px;
    align-items: flex-end;
  }

  .form-row-main {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .form-row-secondary {
    grid-template-columns: 1fr 1fr 1fr auto;
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
    height: 100%;
    flex-wrap: wrap;
  }

  .field-cell {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 4px;
    width: 100%;
  }

  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
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

  /* Narrower dropdown for the header (string) autocomplete */
  .autocomplete-list-sm {
    width: 240px;
  }

  .autocomplete-list-sm .option-key {
    font-family: 'IranYekan', sans-serif;
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

  /* Shared read-only value box — same height/border as the inputs */
  .field-value,
  .value-mono {
    display: block;
    font-size: 13px;
    color: #374151;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 7px 10px;
    overflow-wrap: anywhere;
  }

  .value-mono {
    font-family: monospace;
  }

  .btn-secondary.btn-delete {
    background: var(--palette-error);
    color: white;
  }

  .btn-secondary.btn-delete:hover {
    background: var(--palette-error);
    filter: brightness(0.9);
  }

  .col-actions {
    justify-content: flex-end;
    gap: 8px;
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
    /* Match the height of the text inputs/selects next to them */
    height: 32px;
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
    .form-row-main,
    .form-row-secondary {
      grid-template-columns: 1fr 1fr;
    }

    .col-actions {
      grid-column: 1 / -1;
      justify-content: flex-end;
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

    .form-row-main,
    .form-row-secondary {
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
