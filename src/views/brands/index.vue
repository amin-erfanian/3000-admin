<template>
  <div class="brand-list">
    <div class="brand-list__heading heading">
      <div class="heading__headline">مدیریت برندها</div>
      <div class="heading__border"></div>
      <div class="heading__text">
        اینجا می‌توانید برندهای ثبت شده را مشاهده و تعیین وضعیت کنید
      </div>
    </div>

    <div class="brand-list__filter">
      <ProductFilter v-model="filter" :filterItems="BRAND_FILTER_ITEMS" />
    </div>

    <div class="brand-list__content">
      <template v-if="loading">
        <div
          v-for="index in 3"
          :key="`skeleton-${index}`"
          class="brand-list__skeleton"
        >
          <BaseSkeleton width="100%" height="220px" radius="12px" />
        </div>
      </template>

      <template v-else-if="items.length">
        <BrandDetailsCard
          v-for="item in items"
          :key="item._id || item.id"
          :brand="item"
          @approve="handleApprove"
          @reject="handleReject"
        />
      </template>

      <div v-else class="brand-list__empty">موردی برای نمایش وجود ندارد.</div>
    </div>

    <div class="brand-list__pagination" v-if="pager">
      <BasePagination
        :current-page="pager.page"
        :total-pages="pager.total_pages"
        @change="goToPage"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, watch, computed, onMounted } from 'vue';
  import { usePromise } from '@/composables';

  import { useRoute, useRouter } from 'vue-router';
  import { toast } from 'vue3-toastify';

  import ProductFilter from '@/components/general/product-filter.vue';
  import BasePagination from '@/components/common/base/base-pagination.vue';
  import BaseSkeleton from '@/components/common/base/base-skeleton.vue';
  import BrandDetailsCard from '@/components/general/brand-details-card.vue';

  import {
    getBrands,
    approveBrand,
    rejectBrand,
  } from '@/services/brand.service';
  import { BRAND_FILTER_ITEMS } from '@/constants/filters';

  const router = useRouter();
  const route = useRoute();

  const filter = ref({
    statuses: [],
  });

  const { data: brandList, loading, execute } = usePromise(getBrands);
  const { execute: approveExecute } = usePromise(approveBrand);
  const { execute: rejectExecute } = usePromise(rejectBrand);

  function parseQueryToFilter(query) {
    const parsed = { ...filter.value };

    Object.keys(parsed).forEach((key) => {
      if (!(key in query)) return;

      const value = query[key];

      if (Array.isArray(parsed[key])) {
        parsed[key] = typeof value === 'string' ? value.split(',') : [];
      } else if (typeof parsed[key] === 'boolean') {
        parsed[key] = value === 'true';
      } else {
        parsed[key] = value;
      }
    });

    filter.value = parsed;
  }

  onMounted(() => {
    parseQueryToFilter(route.query);
  });

  watch(
    () => route.query,
    async (newQuery) => {
      parseQueryToFilter(newQuery);

      await execute({
        ...newQuery,
      });
    },
    { immediate: true },
  );

  const items = computed(() => {
    if (Array.isArray(brandList.value)) return brandList.value;
    return brandList.value?.items ?? [];
  });
  const pager = computed(() => brandList.value?.pager ?? null);

  function goToPage(page) {
    router.replace({
      query: {
        ...route.query,
        page: String(page),
      },
    });
  }

  const refetchBrands = async () => {
    await execute({
      ...route.query,
    });
  };

  const handleApprove = async ({ brandId }) => {
    const result = await approveExecute(brandId);
    if (!result) return;

    toast.success('برند با موفقیت تایید شد');
    await refetchBrands();
  };

  const handleReject = async ({ brandId, reason, propertyKeys }) => {
    const result = await rejectExecute(brandId, {
      reason,
      propertyKeys,
    });
    if (!result) return;

    toast.success('برند با موفقیت رد شد');
    await refetchBrands();
  };
</script>

<style lang="scss" scoped>
  .brand-list {
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

    &__filter,
    &__content {
      width: 100%;
    }

    &__content {
      @include flex(column);
      gap: space(3);
    }

    &__empty {
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
