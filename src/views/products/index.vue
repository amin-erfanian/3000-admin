<template>
  <div class="product-list">
    <div class="product-list__heading heading">
      <div class="heading__headline">مدیریت کالا</div>
      <div class="heading__border"></div>
      <div class="heading__text">
        اینجا می‌توانید کالاهای ثبت شده را مشاهده و تعیین وضعیت کنید
      </div>
    </div>

    <div class="product-list__search">
      <Search v-model="searchQuery" @keyup.enter="applySearch" />
    </div>

    <div class="product-list__filter">
      <ProductFilter
        :filterItems="PRODUCT_FILTER_ITEMS"
        @search="handleFilterSearch"
      />
    </div>

    <div class="product-list__content">
      <template v-if="loading">
        <div
          v-for="index in 3"
          :key="`skeleton-${index}`"
          class="product-list__skeleton"
        >
          <BaseSkeleton width="100%" height="220px" radius="12px" />
        </div>
      </template>

      <template v-else-if="items.length">
        <ProductDetailsCard
          v-for="item in items"
          :key="item._id || item.id"
          :product="item"
          @approve="handleApprove"
          @reject="handleReject"
        />
      </template>

      <div v-else class="product-list__empty">موردی برای نمایش وجود ندارد.</div>
    </div>

    <div class="product-list__pagination" v-if="pager">
      <BasePagination
        :current-page="pager.page"
        :total-pages="pager.total_pages"
        @change="goToPage"
      />
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { usePromise } from '@/composables';
  import {
    getProductList,
    approveProduct,
    rejectProduct,
  } from '@/services/product.service';
  import { PRODUCT_FILTER_ITEMS } from '@/constants/filters';
  import Search from '@/components/general/search.vue';
  import ProductFilter from '@/components/general/product-filter.vue';
  import BasePagination from '@/components/common/base/base-pagination.vue';
  import BaseSkeleton from '@/components/common/base/base-skeleton.vue';
  import ProductDetailsCard from '@/components/general/product-details-card.vue';

  const router = useRouter();
  const route = useRoute();

  const searchQuery = ref(route.query.keyword ?? '');

  const { data: productList, loading, execute } = usePromise(getProductList);
  const { execute: approveExecute } = usePromise(approveProduct);
  const { execute: rejectExecute } = usePromise(rejectProduct);

  onMounted(() => execute({ ...route.query }));

  function applySearch() {
    const query = {
      ...route.query,
      ...(searchQuery.value
        ? { keyword: searchQuery.value }
        : { keyword: undefined }),
      page: 1,
    };
    router.replace({ query });
    execute(query);
  }

  function handleFilterSearch(params) {
    execute(params);
  }

  function goToPage(page) {
    const query = { ...route.query, page: String(page) };
    router.replace({ query });
    execute(query);
  }

  const items = computed(() => productList.value?.items ?? []);
  const pager = computed(() => productList.value?.pager ?? null);

  async function handleApprove({ productId }) {
    await approveExecute(productId);
    execute({ ...route.query });
  }

  async function handleReject({ productId, reason, propertyKeys }) {
    await rejectExecute(productId, { reason, propertyKeys });
    execute({ ...route.query });
  }
</script>

<style lang="scss" scoped>
  .product-list {
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

    &__search,
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

    &__pagination-button {
      padding: space(2);
      border-radius: $radius-1x;
      color: #fafafa;
      background-color: var(--palette-primary);
    }
  }
</style>
