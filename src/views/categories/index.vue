<template>
  <div class="categories-manager">
    <div class="header">
      <h2>مدیریت دسته‌بندی‌ها</h2>
      <div class="header-actions">
        <button @click="openCreateModal" class="btn-primary">
          <span class="icon">+</span>
          افزودن دسته‌بندی جدید
        </button>
        <input
          ref="excelInput"
          type="file"
          accept=".xlsx,.xls,.csv"
          class="excel-input"
          @change="onExcelFile"
        />
        <button
          :disabled="importing"
          class="btn-success"
          @click="excelInput?.click()"
        >
          {{ importing ? 'در حال ورود...' : 'ثبت تجمیعی ویژگی‌ها' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">در حال بارگذاری...</div>

    <div v-else-if="error" class="error">
      خطا در بارگذاری دسته‌بندی‌ها: {{ error.message }}
    </div>

    <div v-else class="tree-container">
      <CategoryTreeItem
        v-for="category in rootCategories"
        :key="category._id"
        :category="category"
        @edit="openEditModal"
        @delete="handleDelete"
        @add="handleAddSubCategory"
        @attributes="goToAttributes"
      />
    </div>

    <!-- Create/Edit Modal -->
    <CategoryFormModal
      :show="showModal"
      :category="editingCategory"
      :parent-id="parentCategoryId"
      @close="closeModal"
      @saved="handleSaved"
    />

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="modal-overlay"
      @click.self="closeDeleteModal"
    >
      <div class="modal modal-small">
        <div class="modal-header">
          <h3>تأیید حذف</h3>
          <button @click="closeDeleteModal" class="btn-close">&times;</button>
        </div>

        <div class="modal-body">
          <p
            >آیا از حذف دسته‌بندی "{{ categoryToDelete?.titleFa }}" اطمینان
            دارید؟</p
          >
          <div v-if="deleteError" class="error">{{ deleteError }}</div>
        </div>

        <div class="modal-footer">
          <button @click="closeDeleteModal" class="btn-secondary"
            >انصراف</button
          >
          <button
            @click="confirmDelete"
            :disabled="deleting"
            class="btn-danger"
          >
            {{ deleting ? 'در حال حذف...' : 'حذف' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { toast } from 'vue3-toastify';
  import * as XLSX from 'xlsx';
  import CategoryTreeItem from './CategoryTreeItem.vue';
  import CategoryFormModal from './CategoryFormModal.vue';
  import { usePromise } from '@/composables';
  import { deleteCategory, getCategoryTree } from '@/services/category.service';
  import { createAttributesBatch } from '@/services/attribute.service';

  const router = useRouter();

  // --- Excel batch import (ثبت تجمیعی ویژگی‌ها) ---
  const excelInput = ref(null);
  const {
    loading: importing,
    error: importError,
    execute: createAttributesBatchPromise,
  } = usePromise(createAttributesBatch);

  // Persian header names of the first row in the excel file
  // const EXCEL_COLUMNS = {
  //   کلید: 'key',
  //   عنوان: 'label',
  //   دسته: 'header',
  //   نوع: 'type',
  //   گزینه‌ها: 'options',
  //   پلیس‌هولدر: 'placeholder',
  //   الزامی: 'required',
  // };

  const parseRequired = (value) => {
    if (typeof value === 'boolean') return value;
    const v = String(value ?? '')
      .trim()
      .toLowerCase();
    return v === 'true' || v === 'بله' || v === '1' || v === 'yes';
  };

  const onExcelFile = async (event) => {
    const file = event.target.files?.[0];
    // Allow selecting the same file again after a failed import.
    event.target.value = '';
    if (!file) return;

    let rows;
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
    } catch {
      toast.error('خواندن فایل اکسل ناموفق بود.');
      return;
    }

    if (!rows.length) {
      toast.error('فایل اکسل خالی است.');
      return;
    }

    // Map Persian headers to property names; unknown columns are ignored.
    const headers = Object.keys(rows[0]);
    const mapped = Object.fromEntries(
      headers.map((h) => [String(h).trim(), h]).filter(([prop]) => prop),
    );

    if (!mapped.key || !mapped.label || !mapped.type) {
      toast.error(
        'ستون‌های «کلید»، «عنوان» و «نوع» در فایل اکسل الزامی هستند.',
      );
      return;
    }

    const usedKeys = new Set();
    const payload = [];

    for (const [index, row] of rows.entries()) {
      const key = String(row[mapped.key] ?? '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_');
      const label = String(row[mapped.label] ?? '').trim();
      const type = String(row[mapped.type] ?? '')
        .trim()
        .toLowerCase();

      if (!key || !label) {
        toast.error(`سطر ${index + 2}: «کلید» و «عنوان» الزامی هستند.`);
        return;
      }
      if (!['text', 'select'].includes(type)) {
        toast.error(`سطر ${index + 2}: نوع باید text یا select باشد.`);
        return;
      }
      if (usedKeys.has(key)) {
        toast.error(`سطر ${index + 2}: کلید «${key}» تکراری است.`);
        return;
      }

      // Options live in a single cell, separated by commas
      // (both Latin "," and Persian "،").
      const options =
        type === 'select'
          ? String(row[mapped.options] ?? '')
              .split(/[,،]/)
              .map((option) => option.trim())
              .filter(Boolean)
          : [];

      if (type === 'select' && !options.length) {
        toast.error(
          `سطر ${index + 2}: برای نوع select حداقل یک گزینه لازم است.`,
        );
        return;
      }

      usedKeys.add(key);
      payload.push({
        key,
        label,
        header: mapped.header ? String(row[mapped.header] ?? '').trim() : '',
        type,
        options,
        placeholder: mapped.placeholder
          ? String(row[mapped.placeholder] ?? '').trim()
          : '',
        required: mapped.required ? parseRequired(row[mapped.required]) : false,
      });
    }

    const created = await createAttributesBatchPromise(payload);
    if (!created) {
      // error handled by usePromise
      toast.error(
        importError.value?.message?.fa || 'ورود تجمیعی ویژگی‌ها ناموفق بود.',
      );
      return;
    }

    toast.success(`${payload.length} ویژگی از اکسل وارد شد.`);
  };

  // Fetch categories
  const {
    data,
    loading,
    error,
    execute: fetchCategories,
  } = usePromise(getCategoryTree);

  // Root categories (no parent)
  const rootCategories = computed(() => {
    if (!data.value) return [];
    return data.value.filter((cat) => !cat.parent);
  });

  // Modal state
  const showModal = ref(false);
  const editingCategory = ref(null);
  const parentCategoryId = ref(null);

  const openCreateModal = (parentId = null, isSubCategory = false) => {
    editingCategory.value = null;
    parentCategoryId.value = isSubCategory ? parentId : null;
    showModal.value = true;
  };

  const openEditModal = (category) => {
    editingCategory.value = category;
    parentCategoryId.value = null;
    showModal.value = true;
  };

  const closeModal = () => {
    showModal.value = false;
    editingCategory.value = null;
    parentCategoryId.value = null;
  };

  const handleSaved = async () => {
    closeModal();
    await fetchCategories();
  };

  // Delete modal state
  const showDeleteModal = ref(false);
  const categoryToDelete = ref(null);
  const deleting = ref(false);
  const deleteError = ref(null);

  // Open delete confirmation
  const handleDelete = (category) => {
    categoryToDelete.value = category;
    deleteError.value = null;
    showDeleteModal.value = true;
  };

  // Close delete modal
  const closeDeleteModal = () => {
    showDeleteModal.value = false;
    categoryToDelete.value = null;
    deleteError.value = null;
  };

  // Confirm delete
  const confirmDelete = async () => {
    deleteError.value = null;
    deleting.value = true;

    try {
      await deleteCategory(categoryToDelete.value._id);
      await fetchCategories();
      closeDeleteModal();
    } catch (err) {
      deleteError.value = err.response?.data?.message?.fa || err.message;
    } finally {
      deleting.value = false;
    }
  };

  const handleAddSubCategory = (category) => {
    openCreateModal(category._id, true);
  };

  // Navigate to category attributes (edit) page
  const goToAttributes = (category) => {
    router.push({
      name: 'category-attributes',
      params: { id: category._id },
    });
  };

  onMounted(() => {
    fetchCategories();
  });
</script>

<style scoped>
  .categories-manager {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .header h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
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

  .btn-success {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #16a34a;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  }

  .btn-success:hover {
    background: #15803d;
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

  .btn-danger {
    padding: 10px 20px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: background 0.2s;
  }

  .btn-danger:hover {
    background: #dc2626;
  }

  .btn-danger:disabled {
    background: #9ca3af;
    cursor: not-allowed;
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
    margin-bottom: 16px;
  }

  .tree-container {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
  }

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
    max-width: 600px;
    max-height: 90vh;
    overflow: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }

  .modal-small {
    max-width: 400px;
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

  .icon {
    font-size: 20px;
    line-height: 1;
  }

  .excel-input {
    display: none;
  }
</style>
