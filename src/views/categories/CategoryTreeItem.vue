<!-- CategoryTreeItem.vue -->
<template>
  <div class="tree-item">
    <div class="tree-item-content">
      <button
        v-if="hasChildren"
        @click="toggleExpanded"
        class="expand-btn"
        :class="{ expanded: isExpanded }"
      >
        ▶
      </button>
      <span v-else class="expand-placeholder"></span>

      <div class="category-info">
        <span class="category-title">{{ category.titleFa }}</span>
        <span v-if="category.titleEn" class="category-subtitle">{{
          category.titleEn
        }}</span>
        <span class="category-slug">{{ category.slug }}</span>
        <span v-if="!category.isActive" class="badge-inactive">غیرفعال</span>
      </div>

      <div class="actions">
        <button
          @click="$emit('edit', category)"
          class="btn-icon btn-edit"
          title="ویرایش"
        >
          ✏️
        </button>
        <button
          @click="$emit('delete', category)"
          class="btn-icon btn-delete"
          title="حذف"
        >
          🗑️
        </button>
      </div>
    </div>

    <div v-if="isExpanded && hasChildren" class="tree-children">
      <CategoryTreeItem
        v-for="child in children"
        :key="child._id"
        :category="child"
        :all-categories="allCategories"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  const props = defineProps({
    category: {
      type: Object,
      required: true,
    },
    allCategories: {
      type: Array,
      required: true,
    },
  });

  defineEmits(['edit', 'delete']);

  const isExpanded = ref(false);

  const children = computed(() => {
    return props.allCategories.filter(
      (cat) => cat.parent?._id === props.category._id,
    );
  });

  const hasChildren = computed(() => children.value.length > 0);

  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value;
  };
</script>

<style scoped>
  .tree-item {
    margin-bottom: 4px;
  }

  .tree-item-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    transition: background 0.2s;
  }

  .tree-item-content:hover {
    background: #f3f4f6;
  }

  .expand-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 12px;
    color: #6b7280;
    padding: 4px;
    transition: transform 0.2s;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .expand-btn.expanded {
    transform: rotate(90deg);
  }

  .expand-placeholder {
    width: 20px;
    height: 20px;
  }

  .category-info {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .category-title {
    font-weight: 500;
    color: #111827;
  }

  .category-subtitle {
    color: #6b7280;
    font-size: 14px;
  }

  .category-slug {
    font-family: monospace;
    font-size: 13px;
    color: #6b7280;
    background: #e5e7eb;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .badge-inactive {
    font-size: 12px;
    padding: 2px 8px;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 4px;
    font-weight: 500;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background 0.2s;
  }

  .btn-icon:hover {
    background: #e5e7eb;
  }

  .tree-children {
    margin-top: 4px;
    margin-right: 32px;
    padding-right: 16px;
    border-right: 2px solid #e5e7eb;
  }
</style>
