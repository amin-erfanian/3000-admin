<template>
  <div class="tree-item">
    <div class="tree-item-content">
      <div
        v-if="hasChildren"
        @click="toggleExpanded"
        class="expand-btn"
        :class="{ expanded: isExpanded }"
      >
        <BaseIcon iconName="arrow-left" />
      </div>
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
        <BaseTooltip class="action-btn" text="افزودن زیر مجموعه">
          <BaseIcon
            iconName="add"
            @click="$emit('add', category)"
            class="btn-icon add"
          />
        </BaseTooltip>
        <BaseTooltip class="action-btn" text="ویرایش">
          <BaseIcon
            iconName="edit"
            @click="$emit('edit', category)"
            class="btn-icon edit"
          />
        </BaseTooltip>
        <BaseTooltip class="action-btn" text="حذف">
          <BaseIcon
            iconName="trash-bin"
            @click="$emit('delete', category)"
            class="btn-icon delete"
          />
        </BaseTooltip>
      </div>
    </div>

    <div v-if="isExpanded && hasChildren" class="tree-children">
      <CategoryTreeItem
        v-for="child in props.category.children"
        :key="child._id"
        :category="child"
        @add="$emit('add', $event)"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';

  import BaseIcon from '@/components/common/base/base-icon.vue';
  import BaseTooltip from '@/components/common/base/base-tooltip.vue';

  const props = defineProps({
    category: {
      type: Object,
      required: true,
    },
  });

  defineEmits(['add', 'edit', 'delete']);

  const isExpanded = ref(false);

  const hasChildren = computed(() => {
    return props.category.children.length > 0;
  });

  const toggleExpanded = () => {
    isExpanded.value = !isExpanded.value;
  };
</script>

<style lang="scss" scoped>
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
  }

  .expand-btn {
    cursor: pointer;
    @include flex($align: center, $justify: center);
    color: #6b7280;
    width: 20px;
    height: 20px;
    transition: transform ease-in-out 100ms;
  }

  .expand-btn.expanded {
    transform: rotate(-90deg);
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
    @include flex($align: center);
    gap: space(3);
  }

  .action-btn {
    @include flex($align: center, $justify: center);
  }

  .btn-icon {
    cursor: pointer;
    width: 18px;
    height: 18px;

    &.add {
      color: var(--palette-text-on-main-40);
    }

    &.edit {
      color: var(--palette-primary);
    }

    &.delete {
      color: var(--palette-error);
    }
  }

  .tree-children {
    margin-top: 4px;
    margin-right: 32px;
    padding-right: 16px;
    border-right: 2px solid #e5e7eb;
  }
</style>
