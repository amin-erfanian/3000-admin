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

    <BaseTable
      :headerItems="headers"
      :data="loading ? skeletonRows : items"
      :currentPage="currentPage"
      :itemsPerPage="itemsPerPage"
    >
      <template #cell(image_src)="{ value, item }">
        <BaseSkeleton
          v-if="item._skeleton"
          width="48px"
          height="48px"
          radius="6px"
        />
        <img
          v-else-if="value"
          :src="value"
          style="
            width: 48px;
            height: 48px;
            object-fit: cover;
            border-radius: 6px;
          "
        />
        <span v-else>—</span>
      </template>

      <template #cell(title)="{ value, item }">
        <BaseSkeleton v-if="item._skeleton" width="220px" height="16px" />
        <div v-else style="display: flex; flex-direction: column; gap: 4px">
          <strong>{{ value || '—' }}</strong>
          <small>ID: {{ item.id }}</small>
        </div>
      </template>

      <template #cell(brand)="{ value, item }">
        <BaseSkeleton v-if="item._skeleton" width="120px" height="16px" />
        <span v-else>{{ value || '—' }}</span>
      </template>

      <template #cell(category)="{ value, item }">
        <BaseSkeleton v-if="item._skeleton" width="120px" height="16px" />
        <span v-else>{{ value || '—' }}</span>
      </template>

      <template #cell(status)="{ value, item }">
        <BaseSkeleton v-if="item._skeleton" width="80px" height="16px" />
        <ProductStatusBadge :status="value" />
      </template>

      <template #cell(min_price)="{ value, item }">
        <BaseSkeleton v-if="item._skeleton" width="100px" height="16px" />
        <span v-else>{{ formatPrice(value) }}</span>
      </template>

      <template #cell(number_of_sellers)="{ value, item }">
        <BaseSkeleton v-if="item._skeleton" width="40px" height="16px" />
        <span v-else>{{ value ?? '—' }}</span>
      </template>

      <template #cell(actions)="{ item }">
        <BaseSkeleton v-if="item._skeleton" width="100px" height="16px" />
        <BaseButton
          v-else
          size="small"
          variant="outlined"
          :loading="loadingId === item.id"
          :disabled="loadingId !== null"
          @click="onAddProduct(item)"
        >
          عملیات
        </BaseButton>
      </template>
    </BaseTable>

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
  import BaseTable from '@/components/common/base/base-table.vue';
  import BaseButton from '@/components/common/base/base-button.vue';
  import BasePagination from '@/components/common/base/base-pagination.vue';

  import { getProductList } from '@/services/product.service';
  import BaseSkeleton from '@/components/common/base/base-skeleton.vue';

  import { FILTER_ITEMS } from '@/constants/filters';
  import ProductStatusBadge from '@/components/general/product-status-badge.vue';

  const router = useRouter();
  const route = useRoute();

  const searchQuery = ref('');

  const marketStatusMapper = {
    marketable: { label: 'قابل فروش', variant: 'green' },
    'non-marketable': { label: 'غیر قابل فروش', variant: 'red' },
  };

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

  const headers = [
    { title: 'تصویر', key: 'image_src' },
    { title: 'عنوان', key: 'title', sort: true },
    { title: 'وضعیت', key: 'status', sort: true },
    { title: 'برند', key: 'brand', sort: true },
    { title: 'دسته‌بندی', key: 'category', sort: true },
    { key: 'actions', label: 'عملیات' },
  ];

  const skeletonRows = Array.from({ length: 10 }).map((_, i) => ({
    id: `skeleton-${i}`,
    _skeleton: true,
  }));

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

    // keep searchQuery synced explicitly
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

  const items = computed(() => {
    return productList.value?.items ?? [];
  });
  const pager = computed(() => productList.value?.pager ?? null);

  const currentPage = computed(() => pager.value?.page ?? 1);
  const itemsPerPage = computed(() => pager.value?.item_per_page ?? 10);

  function formatPrice(val) {
    if (val == null) return '—';
    return Number(val).toLocaleString('fa-IR') + ' ریال';
  }

  function goToPage(page) {
    router.replace({
      query: {
        ...route.query,
        page: String(page),
      },
    });
  }

  const handleRouteToAddNewProduct = () => {
    router.replace('/product/create/1');
  };

  const loadingId = ref(null);

  // ── Handler ──────────────────────────────────────────────────
  const onAddProduct = async (item) => {
    loadingId.value = item.id;

    const payload = {
      productId: item.id,
    };

    const result = await submitVariant(payload);

    if (result) {
      console.log('Variant created:', result);
      // toast.success('کالا با موفقیت افزوده شد');
    }

    loadingId.value = null;
  };
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

    &__search {
      width: 100%;
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
