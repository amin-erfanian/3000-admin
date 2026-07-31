<template>
  <div class="category-edit">
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
            <div class="col col-type" data-label="نوع">
              <span class="badge">{{ typeLabel(attr.type) }}</span>
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
                />
              </BaseTooltip>
            </div>
          </div>

          <!-- Inline new attribute row -->
          <div v-if="showNewRow" class="table-row table-new">
            <div class="col col-key" data-label="کلید">
              <input
                v-model="newAttribute.key"
                type="text"
                placeholder="کلید یکتای ذخیره سازی"
                @input="normalizeKey"
              />
            </div>
            <div class="col col-label" data-label="برچسب">
              <input
                v-model="newAttribute.label"
                type="text"
                placeholder="عنوان نمایشی"
              />
            </div>
            <div class="col col-type" data-label="نوع">
              <span class="badge">متن</span>
            </div>
            <div class="col col-required" data-label="وضعیت">
              <label class="radio">
                <input
                  v-model="newAttribute.required"
                  type="radio"
                  :value="true"
                />
                الزامی
              </label>
              <label class="radio">
                <input
                  v-model="newAttribute.required"
                  type="radio"
                  :value="false"
                />
                اختیاری
              </label>
            </div>
            <div class="col col-actions">
              <button @click="addAttribute" class="btn-primary btn-sm">
                افزودن
              </button>
              <button @click="cancelNewRow" class="btn-secondary btn-sm">
                انصراف
              </button>
            </div>
          </div>

          <div v-if="newRowError" class="row-error">{{ newRowError }}</div>
        </div>
      </div>

      <div class="footer">
        <div v-if="saveError" class="error">{{ saveError }}</div>
        <button @click="save" :disabled="saving" class="btn-primary">
          {{ saving ? 'در حال ذخیره...' : 'ذخیره تغییرات' }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { toast } from 'vue3-toastify';
  import BaseIcon from '@/components/common/base/base-icon.vue';
  import BaseTooltip from '@/components/common/base/base-tooltip.vue';
  import { usePromise } from '@/composables';
  import {
    getCategory,
    replaceCategoryAttributes,
  } from '@/services/category.service';

  const route = useRoute();
  const router = useRouter();

  const {
    data: category,
    loading,
    error,
    execute: fetchCategory,
  } = usePromise(getCategory);

  // Local working copy of attributes
  const attributes = ref([]);

  // New attribute inline form
  const showNewRow = ref(false);
  const newRowError = ref(null);
  const newAttribute = ref({
    key: '',
    label: '',
    type: 'text',
    required: true,
  });

  const saving = ref(false);
  const saveError = ref(null);

  const PERSIAN_LETTER = /[؀-ۿ]/;
  const LATIN_LETTER = /[a-zA-Z]/;
  const KEY_PATTERN = /^[a-z0-9_-]+$/;

  const typeLabel = (type) => {
    switch (type) {
      case 'text':
        return 'متن';
      default:
        return type;
    }
  };

  const normalizeKey = () => {
    newAttribute.value.key = newAttribute.value.key
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');
  };

  const openNewRow = () => {
    newAttribute.value = {
      key: '',
      label: '',
      type: 'text',
      required: true,
    };
    newRowError.value = null;
    showNewRow.value = true;
  };

  const cancelNewRow = () => {
    showNewRow.value = false;
    newRowError.value = null;
  };

  const validateNewAttribute = () => {
    const key = newAttribute.value.key.trim();
    const label = newAttribute.value.label.trim();

    if (!key) {
      return 'کلید ویژگی الزامی است.';
    }

    if (!KEY_PATTERN.test(key)) {
      return 'کلید فقط می‌تواند شامل حروف کوچک انگلیسی، عدد، خط تیره و زیرخط باشد.';
    }

    if (attributes.value.some((attr) => attr.key === key)) {
      return 'این کلید قبلاً ثبت شده است؛ کلید تکراری مجاز نیست.';
    }

    if (!label) {
      return 'برچسب ویژگی الزامی است.';
    }

    if (!PERSIAN_LETTER.test(label) || LATIN_LETTER.test(label)) {
      return 'برچسب باید به فارسی وارد شود.';
    }

    return null;
  };

  const addAttribute = () => {
    const validationError = validateNewAttribute();
    if (validationError) {
      newRowError.value = validationError;
      return;
    }

    attributes.value.push({
      key: newAttribute.value.key.trim(),
      label: newAttribute.value.label.trim(),
      type: 'text',
      required: newAttribute.value.required,
    });

    cancelNewRow();
  };

  const removeAttribute = (index) => {
    attributes.value.splice(index, 1);
  };

  const save = async () => {
    saveError.value = null;
    saving.value = true;

    try {
      const updated = await replaceCategoryAttributes(
        route.params.id,
        attributes.value,
      );
      attributes.value = (updated?.attributes || []).map((attr) => ({
        key: attr.key,
        label: attr.label,
        type: attr.type || 'text',
        required: !!attr.required,
      }));
      toast.success('ویژگی‌های دسته‌بندی با موفقیت ذخیره شد.');
    } catch (err) {
      saveError.value = err.response?.data?.message?.fa || err.message;
    } finally {
      saving.value = false;
    }
  };

  const goBack = () => {
    router.push({ name: 'categories' });
  };

  onMounted(async () => {
    await fetchCategory(route.params.id);
    if (category.value) {
      attributes.value = (category.value.attributes || []).map((attr) => ({
        key: attr.key,
        label: attr.label,
        type: attr.type || 'text',
        required: !!attr.required,
      }));
    }
  });
</script>

<style scoped>
  .category-edit {
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
    grid-template-columns: 1.2fr 1.4fr 0.8fr 1.4fr auto;
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
  .col-label {
    flex-wrap: wrap;
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
    .category-edit {
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
