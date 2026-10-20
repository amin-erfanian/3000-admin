<template>
  <div class="warranty-list">
    <div class="warranty-list__heading heading">
      <div class="heading__headline">مدیریت گارانتی‌ها</div>
      <div class="heading__border"></div>
      <div class="heading__text">
        اینجا می‌توانید گارانتی‌های ثبت شده را مشاهده و تعیین وضعیت کنید
      </div>
    </div>

    <div class="warranty-list__toolbar">
      <div class="warranty-list__search">
        <Search
          v-model="searchQuery"
          placeholder="جستجو در عنوان یا توضیحات گارانتی"
          @keyup.enter="applySearch"
        />
      </div>
      <button
        type="button"
        class="warranty-list__toggle"
        :class="{ 'warranty-list__toggle--active': isPendingOnly }"
        :aria-pressed="isPendingOnly"
        @click="togglePending"
      >
        در انتظار تایید
      </button>
      <BaseButton variant="filled" size="small" @click="isAddModalOpen = true">
        افزودن گارانتی
      </BaseButton>
    </div>

    <div class="warranty-list__content">
      <template v-if="loading">
        <BaseSkeleton
          v-for="index in 3"
          :key="`skeleton-${index}`"
          width="100%"
          height="180px"
          radius="12px"
        />
      </template>

      <template v-else-if="items.length">
        <WarrantyDetailsCard
          v-for="item in items"
          :key="item._id"
          :warranty="item"
          :loading="busyWarrantyId === item._id"
          @approve="handleApprove"
          @reject="handleReject"
        />
      </template>

      <div v-else class="warranty-list__empty">
        موردی برای نمایش وجود ندارد.
      </div>
    </div>

    <div class="warranty-list__pagination" v-if="pager">
      <BasePagination
        :current-page="pager.page"
        :total-pages="pager.total_pages"
        @change="goToPage"
      />
    </div>

    <AddWarrantyModal v-model="isAddModalOpen" @submit="handleWarrantyAdded" />
  </div>
</template>

<script setup>
  import { ref, watch, computed, onBeforeUnmount } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { toast } from 'vue3-toastify';
  import { usePromise } from '@/composables';

  import Search from '@/components/general/search.vue';
  import BaseButton from '@/components/common/base/base-button.vue';
  import AddWarrantyModal from '@/components/general/add-warranty-modal.vue';
  import BasePagination from '@/components/common/base/base-pagination.vue';
  import BaseSkeleton from '@/components/common/base/base-skeleton.vue';
  import WarrantyDetailsCard from '@/components/general/warranty-details-card.vue';

  import {
    getWarranties,
    approveWarranty,
    rejectWarranty,
  } from '@/services/warranty.service';

  const router = useRouter();
  const route = useRoute();

  const busyWarrantyId = ref(null);
  const isAddModalOpen = ref(false);
  const searchQuery = ref(route.query.search ?? '');

  const { data: warrantyList, loading, execute } = usePromise(getWarranties);
  const { execute: approveExecute } = usePromise(approveWarranty);
  const { execute: rejectExecute } = usePromise(rejectWarranty);

  watch(
    () => route.query,
    (query) => execute({ ...query }),
    { immediate: true },
  );

  const SEARCH_DEBOUNCE_MS = 400;
  let searchTimer = null;

  // Push the keyword into the URL; the route.query watcher performs the fetch
  function applySearch() {
    clearTimeout(searchTimer);
    const search = searchQuery.value?.trim() || undefined;
    if (search === route.query.search) return;

    router.replace({
      query: {
        ...route.query,
        search,
        page: undefined,
      },
    });
  }

  watch(searchQuery, () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(applySearch, SEARCH_DEBOUNCE_MS);
  });

  onBeforeUnmount(() => clearTimeout(searchTimer));

  const isPendingOnly = computed(() => route.query.status === 'pending');

  function togglePending() {
    router.replace({
      query: {
        ...route.query,
        status: isPendingOnly.value ? undefined : 'pending',
        page: undefined,
      },
    });
  }

  function handleWarrantyAdded() {
    execute({ ...route.query });
  }

  const items = computed(() => warrantyList.value?.items ?? []);
  const pager = computed(() => warrantyList.value?.pager ?? null);

  function goToPage(page) {
    router.replace({
      query: {
        ...route.query,
        page: String(page),
      },
    });
  }

  async function changeStatus(warrantyId, action, successMessage) {
    busyWarrantyId.value = warrantyId;
    try {
      const result = await action(warrantyId);
      if (!result) return;

      toast.success(successMessage);
      await execute({ ...route.query });
    } finally {
      busyWarrantyId.value = null;
    }
  }

  const handleApprove = ({ warrantyId }) =>
    changeStatus(warrantyId, approveExecute, 'گارانتی با موفقیت تایید شد');

  const handleReject = ({ warrantyId }) =>
    changeStatus(warrantyId, rejectExecute, 'گارانتی با موفقیت رد شد');
</script>

<style lang="scss" scoped>
  .warranty-list {
    width: 100%;
    @include flex(column);
    gap: space(10);

    &__heading {
      width: 100%;
    }

    .heading {
      @include flex($align: center);
      gap: space(2);

      &__headline {
        @include typography(label-medium);
        font-weight: 900;
        color: var(--palette-text-on-main-10);
      }

      &__border {
        width: 2px;
        height: 20px;
        background-color: var(--palette-text-on-main-10);
        border-radius: 4px;
      }

      &__text {
        @include typography(body-small);
        color: var(--palette-text-on-main-30);
      }
    }

    &__toolbar {
      width: 100%;
      @include flex($align: center);
      gap: space(3);
    }

    &__search {
      flex: 1;
    }

    // matches the `small` outlined BaseTextInput
    &__toggle {
      box-sizing: border-box;
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

    &__content {
      width: 100%;
    }

    &__content {
      @include flex(column);
      gap: space(3);
    }

    &__empty {
      width: 100%;
      border: 1px dashed var(--palette-border-10);
      border-radius: $radius-2x;
      padding: space(6);
      text-align: center;
      color: var(--palette-text-on-main-40);
    }

    &__pagination {
      width: 100%;
      @include flex($align: center, $justify: center);
      margin-top: 12px;
      gap: space(4);
    }
  }
</style>
