<template>
  <div class="filter">
    <div
      class="filter__icon-wrapper"
      :class="{ 'filter__icon-wrapper--active': hasActiveFilters }"
    >
      <BaseIcon iconName="filter" />
      <span>فیلترها</span>
    </div>

    <div class="filter__items">
      <template v-for="(filterItem, index) in filterItems" :key="index">
        <!-- BADGE -->
        <div
          v-if="filterItem.type === 'badge'"
          class="filter__badge"
          :class="{ active: filter[filterItem.key] }"
          @click="toggleBadge(filterItem.key)"
        >
          <p>
            {{ filterItem.label }}
          </p>
        </div>

        <!-- DROPDOWN -->
        <BaseDropContent v-else :label="filterItem.label">
          <FilterDropdownContent
            :filterItem="filterItem"
            v-model="filter[filterItem.key]"
            @change="updateQueryParams"
          />
        </BaseDropContent>
      </template>
    </div>
  </div>
</template>

<script setup>
  import { useRouter, useRoute } from 'vue-router';

  import BaseDropContent from '../common/base/base-drop-content.vue';
  import BaseIcon from '../common/base/base-icon.vue';
  import FilterDropdownContent from '@/views/products/filter-dropdown-content.vue';

  import { computed } from 'vue';

  const router = useRouter();
  const route = useRoute();

  const props = defineProps({
    filterItems: {
      type: Array,
      default: () => [],
    },
  });

  const filter = defineModel({
    default: {
      categories: [],
      brands: [],
      types: [],
      statuses: [],
      colors: [],
      fake: null,
      heigh_selling: false,
      heigh_demand: false,
      low_stock: false,
    },
  });

  function toggleBadge(key) {
    filter.value[key] = !filter.value[key];
    updateQueryParams();
  }

  function updateQueryParams() {
    const query = {
      ...route.query,
    };

    Object.entries(filter.value).forEach(([key, val]) => {
      if (Array.isArray(val) && val.length) {
        query[key] = val.join(',');
      } else if (val === true) {
        query[key] = 'true';
      } else {
        delete query[key];
      }
    });

    router.replace({ query });
  }

  const hasActiveFilters = computed(() => {
    return Object.values(filter.value).some((val) => {
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === 'boolean') return val === true;
      if (val !== null && val !== undefined && val !== '') return true;
      return false;
    });
  });
</script>

<style scoped lang="scss">
  .filter {
    display: flex;
    align-items: center;
    gap: 8px;

    &__icon-wrapper {
      @include flex($align: center, $justify: center);
      gap: space();

      &--active {
        color: var(--palette-primary);
      }
    }

    &__items {
      display: flex;
      gap: 12px;
    }

    &__badge {
      border: 1px solid var(--palette-border-10);
      padding: space(0.5) space(2);
      border-radius: 6px;
      background: transparent;
      cursor: pointer;

      p {
        color: var(--palette-text-on-main-10);
        @include typography(body-small);
        white-space: nowrap;
      }

      &.active {
        background: var(--palette-primary);
        color: white;
      }
    }
  }
</style>
