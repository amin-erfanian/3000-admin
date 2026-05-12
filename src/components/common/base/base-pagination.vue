<template>
  <div class="pagination">
    <!-- FIRST PAGE -->
    <button
      class="pagination__btn"
      :disabled="currentPage === 1"
      @click="goToPage(1)"
    >
      «
    </button>

    <!-- PREV PAGE -->
    <button
      class="pagination__btn"
      :disabled="currentPage === 1"
      @click="goToPage(currentPage - 1)"
    >
      ‹
    </button>

    <!-- PAGE NUMBERS -->
    <template v-for="page in pages" :key="page.key">
      <span
        v-if="page.type === 'ellipsis'"
        class="pagination__ellipsis"
        :key="page.key"
      >
        ...
      </span>

      <button
        v-else
        class="pagination__btn"
        :class="{ 'pagination__btn--active': page.number === currentPage }"
        @click="goToPage(page.number)"
      >
        {{ page.number }}
      </button>
    </template>

    <!-- NEXT PAGE -->
    <button
      class="pagination__btn"
      :disabled="currentPage === totalPages"
      @click="goToPage(currentPage + 1)"
    >
      ›
    </button>

    <!-- LAST PAGE -->
    <button
      class="pagination__btn"
      :disabled="currentPage === totalPages"
      @click="goToPage(totalPages)"
    >
      »
    </button>
  </div>
</template>

<script setup>
  import { computed } from 'vue';

  const props = defineProps({
    currentPage: { type: Number, required: true },
    totalPages: { type: Number, required: true },
    maxVisible: { type: Number, default: 5 },
  });

  const emit = defineEmits(['change']);

  function goToPage(p) {
    if (p < 1 || p > props.totalPages) return;
    emit('change', p);
  }

  const pages = computed(() => {
    const pagesArr = [];
    const { currentPage, totalPages, maxVisible } = props;

    if (totalPages <= maxVisible) {
      // simple case
      for (let i = 1; i <= totalPages; i++) {
        pagesArr.push({ type: 'page', number: i, key: `p-${i}` });
      }
      return pagesArr;
    }

    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    // Ensure consistent count
    if (end - start + 1 < maxVisible) {
      if (start === 1) end = maxVisible;
      else if (end === totalPages) start = totalPages - maxVisible + 1;
    }

    // Add first + ellipsis
    if (start > 1) {
      pagesArr.push({ type: 'page', number: 1, key: 'p-1' });
      if (start > 2) pagesArr.push({ type: 'ellipsis', key: 'e-start' });
    }

    // Main pages
    for (let i = start; i <= end; i++) {
      pagesArr.push({ type: 'page', number: i, key: `p-${i}` });
    }

    // Add ellipsis + last
    if (end < totalPages) {
      if (end < totalPages - 1)
        pagesArr.push({ type: 'ellipsis', key: 'e-end' });

      pagesArr.push({
        type: 'page',
        number: totalPages,
        key: `p-last`,
      });
    }

    return pagesArr;
  });
</script>

<style lang="scss" scoped>
  .pagination {
    @include flex($align: center, $justify: center);
    gap: space(2);
    margin-top: space(8);

    &__btn {
      @include typography(body-small);
      padding: space(2) space(4);
      border-radius: $radius-1x;
      background: #d1e3ff;
      color: var(--palette-text-primary);
      border: 1px solid var(--palette-border);
      cursor: pointer;
      transition: 0.15s ease;

      &:hover:not(:disabled) {
        background: var(--palette-primary);
        color: #fff;
      }

      &:disabled {
        opacity: 0.4;
        cursor: default;
      }
    }

    &__btn--active {
      background: var(--palette-primary);
      color: #fff;
      cursor: default;
    }

    &__ellipsis {
      padding: space(2) space(4);
      opacity: 0.5;
    }
  }
</style>
