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
      <ProductFilter v-model="filter" :filterItems="FILTER_ITEMS" />
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
  import { ref, watch, computed, onMounted } from 'vue';
  import { usePromise } from '@/composables';

  import { useRoute, useRouter } from 'vue-router';

  import Search from '@/components/general/search.vue';
  import ProductFilter from '@/components/general/product-filter.vue';
  import BasePagination from '@/components/common/base/base-pagination.vue';
  import BaseSkeleton from '@/components/common/base/base-skeleton.vue';
  import ProductDetailsCard from '@/components/general/product-details-card.vue';

  import { getProductList } from '@/services/product.service';
  import { FILTER_ITEMS } from '@/constants/filters';

  const router = useRouter();
  const route = useRoute();

  const searchQuery = ref('');

  const filter = ref({
    categories: [],
    brands: [],
    types: [],
    statuses: [],
    colors: [],
    fake: null,
    heigh_selling: false,
    heigh_demand: false,
    low_stock: false,
    keyword: '',
  });

  const { data: productList, loading, execute } = usePromise(getProductList);

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
    searchQuery.value = query.keyword ?? '';
  }

  onMounted(() => {
    parseQueryToFilter(route.query);
    searchQuery.value = route.query.keyword ?? '';
  });

  function applySearch() {
    router.replace({
      query: {
        ...route.query,
        keyword: searchQuery.value || undefined,
        page: 1,
      },
    });
  }

  watch(
    () => route.query,
    async (newQuery) => {
      parseQueryToFilter(newQuery);

      await execute({
        ...newQuery,
        keyword: searchQuery.value,
      });
    },
    { immediate: true },
  );

  const items = computed(() => productList.value?.items ?? []);
  const pager = computed(() => productList.value?.pager ?? null);

  function goToPage(page) {
    router.replace({
      query: {
        ...route.query,
        page: String(page),
      },
    });
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
