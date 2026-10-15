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
      <template v-for="(item, i) in filterItems" :key="i">
        <button
          v-if="item.type === 'toggle'"
          type="button"
          class="filter__toggle"
          :class="{
            'filter__toggle--active': localFilter[item.key] === item.value,
          }"
          :aria-pressed="localFilter[item.key] === item.value"
          @click="toggleFilter(item)"
        >
          {{ item.label }}
        </button>
        <BaseTextInput
          v-else
          :placeholder="item.label"
          v-model="localFilter[item.key]"
          type="text"
          variant="outlined"
        />
      </template>
    </div>

    <div class="filter__actions">
      <BaseButton size="small" variant="outlined" @click="clearFilters"
        >پاک کردن فیلترها</BaseButton
      >
      <BaseButton size="small" variant="filled" @click="applyFilters"
        >جستجو</BaseButton
      >
    </div>
  </div>
</template>

<script setup>
  import { useRouter, useRoute } from 'vue-router';
  import { reactive, computed } from 'vue';
  import BaseIcon from '../common/base/base-icon.vue';
  import BaseTextInput from '../common/base/base-text-input.vue';
  import BaseButton from '../common/base/base-button.vue';

  const props = defineProps({
    filterItems: { type: Array, default: () => [] },
  });

  const emit = defineEmits(['search']);

  const router = useRouter();
  const route = useRoute();

  const localFilter = reactive(
    Object.fromEntries(
      props.filterItems.map(({ key }) => [key, route.query[key] ?? '']),
    ),
  );

  function applyFilters() {
    const query = { ...route.query };
    delete query.page;
    props.filterItems.forEach(({ key }) => {
      if (localFilter[key]) query[key] = localFilter[key];
      else delete query[key];
    });
    router.replace({ query });
    emit('search', { ...query });
  }

  function toggleFilter({ key, value }) {
    localFilter[key] = localFilter[key] === value ? '' : value;
    applyFilters();
  }

  function clearFilters() {
    const query = { ...route.query };
    delete query.page;
    props.filterItems.forEach(({ key }) => {
      localFilter[key] = '';
      delete query[key];
    });
    router.replace({ query });
    emit('search', { ...query });
  }

  const hasActiveFilters = computed(() =>
    props.filterItems.some(({ key }) => !!route.query[key]),
  );
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
      align-items: center;
      gap: 12px;
    }

    // matches the `small` outlined BaseTextInput
    &__toggle {
      box-sizing: border-box;
      width: 100%;
      min-height: 40px;
      padding: space(1) space(3);
      border: 1px solid var(--palette-border-20);
      border-radius: $radius-2x;
      background-color: transparent;
      color: var(--palette-text-on-main-20);
      @include typography(body-medium);
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s ease;

      &--active {
        background-color: var(--palette-primary);
        border-color: var(--palette-primary);
        color: #fafafa;
      }
    }

    &__actions {
      display: flex;
      gap: space(2);
      margin-inline-start: auto;
    }
  }
</style>
