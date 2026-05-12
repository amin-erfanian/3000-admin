<template>
  <nav v-if="breadcrumbItems.length > 0" class="category-breadcrumb">
    <div class="category-breadcrumb__list">
      <template v-for="(item, index) in breadcrumbItems" :key="item.slug">
        <button
          class="category-breadcrumb__item"
          :class="{
            'category-breadcrumb__item--active':
              index === breadcrumbItems.length - 1,
          }"
          @click="handleItemClick(item, index)"
        >
          <span class="category-breadcrumb__text">{{ item.title }}</span>
        </button>
        <div
          v-if="index < breadcrumbItems.length - 1"
          class="category-breadcrumb__separator"
        >
          /
        </div>
      </template>
    </div>
  </nav>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    items: {
      type: Array,
      default: () => [],
    },
  });

  const emit = defineEmits(['item-click']);

  const breadcrumbItems = computed(() => {
    return props.items.map((item) => ({
      slug: item.slug,
      title: item.titleFa || item.titleEn || item.name || 'دسته‌بندی',
    }));
  });

  const handleItemClick = (item) => {
    emit('item-click', item);
  };
</script>

<style lang="scss" scoped>
  .category-breadcrumb {
    padding-bottom: 16px;

    &__list {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    &__item {
      display: flex;
      align-items: center;
      background: none;
      border: none;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 12px;
      transition: color 0.2s ease;
      border-radius: 4px;
      color: var(--palette-text-on-main-30);
    }

    &__text {
      white-space: nowrap;
    }

    &__separator {
      display: flex;
      align-items: center;
      color: var(--palette-text-on-main-30);
      flex-shrink: 0;

      :deep(.base-icon) {
        width: 16px;
        height: 16px;
      }
    }
  }
</style>
