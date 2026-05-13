<template>
  <div class="categories-manager">
    <div class="header">
      <h2>مدیریت دسته‌بندی‌ها</h2>
      <button @click="openCreateModal" class="btn-primary">
        <span class="icon">+</span>
        افزودن دسته‌بندی جدید
      </button>
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
        :all-categories="data"
        @edit="openEditModal"
        @delete="handleDelete"
      />
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{
            isEditMode ? 'ویرایش دسته‌بندی' : 'افزودن دسته‌بندی جدید'
          }}</h3>
          <button @click="closeModal" class="btn-close">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>عنوان فارسی *</label>
            <input
              v-model="form.titleFa"
              type="text"
              placeholder="عنوان فارسی"
            />
          </div>

          <div class="form-group">
            <label>عنوان انگلیسی</label>
            <input
              v-model="form.titleEn"
              type="text"
              placeholder="عنوان انگلیسی"
            />
          </div>

          <div class="form-group">
            <label>اسلاگ *</label>
            <input v-model="form.slug" type="text" placeholder="slug-example" />
          </div>

          <div class="form-group">
            <label>دسته‌بندی والد</label>
            <select v-model="form.parent">
              <option :value="null">بدون والد (دسته اصلی)</option>
              <option
                v-for="cat in availableParents"
                :key="cat._id"
                :value="cat._id"
                :disabled="isEditMode && cat._id === form._id"
              >
                {{ cat.titleFa }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>تصویر (URL)</label>
            <input v-model="form.image" type="text" placeholder="https://..." />
          </div>

          <div class="form-group">
            <label>هشدار دلیل بازگشت</label>
            <textarea v-model="form.returnReasonAlert" rows="3"></textarea>
          </div>

          <div class="form-group checkbox">
            <label>
              <input v-model="form.isActive" type="checkbox" />
              فعال
            </label>
          </div>

          <div v-if="modalError" class="error">{{ modalError }}</div>
        </div>

        <div class="modal-footer">
          <button @click="closeModal" class="btn-secondary">انصراف</button>
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
  import CategoryTreeItem from './CategoryTreeItem.vue';
  import axios from 'axios';
  import { usePromise } from '@/composables';

  const API_BASE = '/api/categories';

  // Fetch categories
  const {
    data,
    loading,
    error,
    execute: fetchCategories,
  } = usePromise(() => axios.get(`${API_BASE}/tree`).then((res) => res.data));

  // Root categories (no parent)
  const rootCategories = computed(() => {
    if (!data.value) return [];
    return data.value.filter((cat) => !cat.parent);
  });

  // Available parents for dropdown (all categories)
  const availableParents = computed(() => data.value || []);

  // Modal state
  const showModal = ref(false);
  const isEditMode = ref(false);
  const form = ref({
    _id: null,
    titleFa: '',
    titleEn: '',
    slug: '',
    parent: null,
    image: '',
    returnReasonAlert: '',
    isActive: true,
  });
  const submitting = ref(false);
  const modalError = ref(null);

  // Delete modal state
  const showDeleteModal = ref(false);
  const categoryToDelete = ref(null);
  const deleting = ref(false);
  const deleteError = ref(null);

  // Open create modal
  const openCreateModal = () => {
    isEditMode.value = false;
    form.value = {
      _id: null,
      titleFa: '',
      titleEn: '',
      slug: '',
      parent: null,
      image: '',
      returnReasonAlert: '',
      isActive: true,
    };
    modalError.value = null;
    showModal.value = true;
  };

  // Open edit modal
  const openEditModal = (category) => {
    isEditMode.value = true;
    form.value = {
      _id: category._id,
      titleFa: category.titleFa,
      titleEn: category.titleEn || '',
      slug: category.slug,
      parent: category.parent?._id || null,
      image: category.image || '',
      returnReasonAlert: category.returnReasonAlert || '',
      isActive: category.isActive,
    };
    modalError.value = null;
    showModal.value = true;
  };

  // Close modal
  const closeModal = () => {
    showModal.value = false;
    form.value = {
      _id: null,
      titleFa: '',
      titleEn: '',
      slug: '',
      parent: null,
      image: '',
      returnReasonAlert: '',
      isActive: true,
    };
    modalError.value = null;
  };

  // Submit form (create or update)
  const handleSubmit = async () => {
    modalError.value = null;

    if (!form.value.titleFa || !form.value.slug) {
      modalError.value = 'عنوان فارسی و اسلاگ الزامی است.';
      return;
    }

    submitting.value = true;

    try {
      if (isEditMode.value) {
        await axios.put(`${API_BASE}/${form.value._id}`, form.value);
      } else {
        await axios.post(API_BASE, form.value);
      }

      await fetchCategories();
      closeModal();
    } catch (err) {
      modalError.value = err.response?.data?.message?.fa || err.message;
    } finally {
      submitting.value = false;
    }
  };

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
      await axios.delete(`${API_BASE}/${categoryToDelete.value._id}`);
      await fetchCategories();
      closeDeleteModal();
    } catch (err) {
      deleteError.value = err.response?.data?.message?.fa || err.message;
    } finally {
      deleting.value = false;
    }
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

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }

  .form-group input[type='text'],
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
  }

  .form-group input[type='text']:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .form-group.checkbox {
    display: flex;
    align-items: center;
  }

  .form-group.checkbox label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0;
    cursor: pointer;
  }

  .form-group.checkbox input[type='checkbox'] {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  .icon {
    font-size: 20px;
    line-height: 1;
  }
</style>
